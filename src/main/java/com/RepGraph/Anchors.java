
package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonGetter;

/**
 * This class stores the Token span information of a Node
 */
public class Anchors {

    private int from;

    @JsonAlias({"end","to"})
    private int end;

    /**
     * Default constructor
     */
    public Anchors() {}

    public Anchors(Anchors a) {
        this.from = a.from;
        this.end = a.end;
    }

    /**
     * This is the parameterised constructor
     *
     * @param from This refers to the first Token in the Node span
     * @param end  This refers to the last Token in the Node span
     */
    public Anchors(int from, int end) {
        this.from = from;
        this.end = end;
    }

    /**
     * This is the getter method for the "from" private variable
     *
     * @return int This is the value of "from"
     */
    public int getFrom() {
        return from;
    }

    /**
     * This is the getter method for the "end" private variable
     *
     * @return int This is the value of "end"
     */

    public int getEnd() {
        return end;
    }

    /**
     * This is the setter method for the "end" private variable
     *
     * @param end This is the value that the "end" variable will be set to.
     */
    public void setEnd(int end) {
        this.end = end;
    }

    /**
     * This is the setter method for the "from" private variable
     *
     * @param from This is the value that the "from" variable will be set to.
     */
    public void setFrom(int from) {
        this.from = from;
    }

    /**
     * Equals method for the Node class.
     *
     * @param o Object
     * @return boolean Whether to two classes being compared are equal.
     */
    @Override
    public boolean equals(Object o) {

        if (o == this) {
            return true;
        }

        if (!(o instanceof Anchors)) {
            return false;
        }

        Anchors a = (Anchors) o;

        return (from == a.getFrom()) && (end == a.getEnd());
    }


}
