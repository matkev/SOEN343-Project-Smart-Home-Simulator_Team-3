import {useEffect} from 'react';
import useStyle from "../styles";
import {useDashboardState} from "../../../context/DashboardContext";
import {setZones, useSHHDispatch, useSHHState} from "../../../context/SHHContext";
import {addLog, useLogDispatch} from "../../../context/LogContext";
import {useClockState} from "../../../context/ClockContext";
import {toast} from "react-toastify";
import {getZoneList} from "../../../Api/api_zones";
import classNames from 'classnames';

const HAVCSystem = ({setCoreChanges, children}) => {
  const classes = useStyle();
  const shhDispatch = useSHHDispatch();
  const shhState = useSHHState();
  const clockState = useClockState();
  const logDispatch = useLogDispatch();
  const dashboardState = useDashboardState();
  const {rooms, weather} = dashboardState;
  const {zones} = shhState;
  const dayPeriods = ["morning", "day", "night"];

  //power is the temperature the havc can change in a room per second.
  const havcPower = 0.1;
  //temperature margin is the minimum difference of room temperature to target to have the havc affect the room temperature.
  const havcTempMargin = 0.25;
  //cool down is natural rate per second of temperature decrease
  const havcCoolDown = 0.05;

  useEffect(()=>{
    //initialize the list of zones to display.
    if (zones.length === 0){
      getListofZonesAdapter().then((data)=> {
        setZones(shhDispatch, data);
      }).catch(err => {
        toast.error(err.message);
      });;
    }
    initRoomTemperatures();

  }, []);// only run on mount and unmount

  //assume clockState.time updates only every second.
  useEffect(()=>{
    updateRoomTemperatures();
  }, [clockState.time]);

  //initialize room temperatures if new rooms are added.
  useEffect(()=>{
    initRoomTemperatures();
  }, [JSON.stringify(rooms)]);  //update whenever rooms changes in any manner.


  //listen on target temperature updates.
  useEffect(()=>{
    updateTargetTemperatures();
  }, [JSON.stringify(shhState.zones), JSON.stringify(rooms), weather.current?.temperature]);  //update whenever the zones or rooms update in any manner, or if the outside temperature changes.

  const initRoomTemperatures = () => {
    const tempTemperature = weather.current?.temperature ?? 0;
    //for each room, set the temperature to the outside temperature.
    rooms.forEach((room)=>{
      if (room.havc_temp === undefined){
        room.havc_temp = tempTemperature;
      }
    });
  };

  //iterate for each room. target temp: if room doesn't have override temp, then check if there's a zone that has it.
  //  otherwise, target temp is current wheather temp.
  const updateTargetTemperatures = () => {
    //for each room,
    rooms.forEach((room)=>{
      //if the target temp is specific to room, use that.
      if(room.overridden_temperature != null){
        room.havc_target_temp = room.overridden_temperature;
      }
      else{
        //if it's in a zone, the target temperature is the zone's
        // otherwise, it is the current outside temperature.
        const zoneOfRoom = shhState.zones.find((zone) => zone.rooms.includes(room.id));
        if (zoneOfRoom !== undefined && zoneOfRoom[dayPeriods[dashboardState.daycycle]] !== undefined){
          room.havc_target_temp = zoneOfRoom[dayPeriods[dashboardState.daycycle]];
        }
        else{
          room.havc_target_temp = weather.current?.temperature??0;
        }
      }
    });
  };

  //update each room temperature towards its target if the system is on for that room, or towards the weather's if it's off.
  const updateRoomTemperatures=()=>{
    console.log("ROOMS HAVC: ");
    //iterate on all rooms.
    rooms.forEach((room)=>{
      //determine variation power based on whether the havc system is on for the room.
      let power, target;
      if (room.havc_paused){
        power = havcCoolDown;
        target = weather.current?.temperature ?? 0;
      }
      else{
        power = havcPower;
        target = room.havc_target_temp;
      }

      //check direction to vary temperature. chooses no variation if tempeartures are within margin.
      const direction = directionFromto(room.havc_temp, target, power);

      //no variation, so pause the system for the room.
      if (direction == 0){
        if (!room.havc_paused){
          room.havc_paused = true;
          addLog(logDispatch, `HAVC disabled in room ${room.name}. `);
        }
      }
      //variation
      else{
        //havc affects room temperature.
        room.havc_temp += direction * power;
        //restrict temperature to 2 deciamls (float point).
        room.havc_temp = parseFloat(room.havc_temp.toFixed(2));
      }

      if (room.havc_paused){
        //havc may reactivate if temp difference to target is enough.
        if(Math.abs(room.havc_target_temp-room.havc_temp) >= havcTempMargin){
          room.havc_paused = false;
          addLog(logDispatch, `HAVC reactivated in room ${room.name}. `);
        }
      }

      {//console logging debug.
        const tempRoom = {...room};
        for (const key in tempRoom) {
          if (tempRoom.hasOwnProperty(key)) {
            if (!["id", "name", "havc_temp", "havc_target_temp", "havc_paused"].includes(key)){
              delete tempRoom[key];
            }
          }
        }
        console.log(tempRoom);
      }
    });
  };

  //round the number away from 0. (JS Math.round always rounds up).
  function roundAway(number){
    const sign = Math.sign(number);
    return sign * Math.round(Math.abs(number));
  }

  //get direction between two numbers
  function directionFromto(from, to, precision){
    //calculated power's margin is used to calculate when the temperature is within the target's margin.
    const margin = 0.5/precision;

    const difference = to-from;
    const diff2 = parseFloat((margin*difference).toFixed(2));
    const direction = Math.sign(roundAway(diff2));
    return direction;
  }

  //since the format of the zone isn't determined yet, this function acts like an adapter.
  //to be used when getting zones from the DB.
  function getListofZonesAdapter(){
    return getZoneList();
    //from zone: ??
    // to  zone: {id, name, morning, day, night, rooms:[ roomId1, roomId2, ...]}
  }

  return children;
}

export default HAVCSystem;