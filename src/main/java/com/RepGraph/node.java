/**
 * A semantic node class that represents a node in a graph.
 * @since 29/08/2020
 */

package com.RepGraph;

import java.util.ArrayList;

public class node {

    /**
     * The node's ID number.
     */
    private int id;

    /**
     * The node's label.
     */
    private String label;

    /**
     * An array list of anchors which give the node to token index alignment.
     */
    private ArrayList<String> anchors;

    /**
     * An array list of neighbouring nodes.
     */
    private ArrayList<Integer> nodeNeighbours;

    /**
     * Default constructor for the node class.
     */
    public node(){}

    /**
     * Fully parameterised constructor for the node class.
     * @param id The node's ID number.
     * @param label The node's label.
     * @param anchors An array list of the node's anchors.
     */
    public node(int id, String label, ArrayList<String> anchors){
        this.id = id;
        this.label = label;
        this.anchors = anchors;
    }

    /**
     * Getter method for the node's ID number.
     * @return Integer The node's ID number.
     */
    public int getId() {
        return id;
    }

    /**
     * Setter method for the node's ID number.
     * @param id The node's ID number.
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Getter method for the node's label.
     * @return String The node's label.
     */
    public String getLabel() {
        return label;
    }

    /**
     * Setter method for the node's label.
     * @param label The node's label.
     */
    public void setLabel(String label) {
        this.label = label;
    }

    /**
     * Getter method for the the node's anchors.
     * @return ArrayList The node's anchors.
     */
    public ArrayList<String> getAnchors() {
        return anchors;
    }

    /**
     * Setter method for the the node's anchors.
     * @param anchors The node's anchors.
     */
    public void setAnchors(ArrayList<String> anchors) {
        this.anchors = anchors;
    }

    /**
     * Adds a neighbouring node.
     * @param neighbour A neighbouring node
     */
    public void addNeighbour(int neighbour){
        nodeNeighbours.add(neighbour);
    }
}
