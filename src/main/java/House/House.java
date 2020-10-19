package House;

import Data.ObjectIdSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.types.ObjectId;

import java.util.Objects;

/**
 * Class modeling the House entity. House objects are mapped into the 'houses' collection in the MongoDB database.
 */
public class House {
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;
    private String name;

    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId user_id;

    /**
     * Default House constructor
     */
    public House() {

    }

    /**
     * Construct a new House instance
     *
     * @param id the ObjectId
     * @param name the name of the house
     * @param user_id the id of the user who created the House
     */
    public House(ObjectId id, String name, ObjectId user_id) {
        this.id = id;
        this.name = name;
        this.user_id = user_id;
    }

    /**
     * Returns the id
     *
     * @return the id
     */
    public ObjectId getId() {
        return id;
    }

    /**
     * Sets the id
     *
     * @param id the id
     */
    public void setId(ObjectId id) {
        this.id = id;
    }

    /**
     * Returns the name
     *
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the id
     *
     * @param name the name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the id of the user who created the House
     *
     * @return the id of the user who created the House
     */
    public ObjectId getUser_id() {
        return user_id;
    }

    /**
     * Sets the id of the user who created the House
     *
     * @param user_id the id of the user who created the House
     */
    public void setUser_id(ObjectId user_id) {
        this.user_id = user_id;
    }

    /**
     * Returns a string representation of a House object
     *
     * @return string representation of a House object
     */
    @Override
    public String toString() {
        return "House{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", user_id=" + user_id +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        House house = (House) o;
        return Objects.equals(id, house.id) &&
                Objects.equals(name, house.name) &&
                Objects.equals(user_id, house.user_id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, user_id);
    }
}
