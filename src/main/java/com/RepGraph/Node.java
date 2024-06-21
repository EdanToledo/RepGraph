/**
 * A semantic Node class that represents a Node in a Graph.
 *
 * @since 29/08/2020
 */

package com.RepGraph;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Node object - contains node information
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Node {


    @JsonProperty("id")
    private String id;

    @JsonProperty("label")
    private String label;

    @JsonProperty("anchors")
    private ArrayList<Anchors> anchors;

    @JsonProperty("properties")
    private ArrayList<String> properties;

    @JsonProperty("values")
    private ArrayList<String> values;

    @JsonProperty("surface")
    private boolean surface;

    @JsonProperty("dummy")
    private boolean dummy = false;

    @JsonIgnore
    private ArrayList<Anchors> characterSpans;

    @JsonIgnore
    private ArrayList<Node> directedNeighbours;


    @JsonIgnore
    private ArrayList<Node> undirectedNeighbours;


    @JsonIgnore
    private ArrayList<Edge> directedEdgeNeighbours;


    @JsonIgnore
    private ArrayList<Edge> undirectedEdgeNeighbours;


    public Node() {
        this.directedNeighbours = new ArrayList<>();
        this.undirectedNeighbours = new ArrayList<>();
        this.directedEdgeNeighbours = new ArrayList<>();
        this.undirectedEdgeNeighbours = new ArrayList<>();
    }

    /**
     * Fully parameterised constructor for the Node class.
     * @param id The Node's ID number.
     * @param label The Node's label.
     * @param anchors An array list of the Node's Anchors.
     */
    public Node(String id, String label, ArrayList<Anchors> anchors) {
        this.id = id;
        this.label = label;
        this.anchors = anchors;
        this.undirectedNeighbours = new ArrayList<>();
        this.directedNeighbours = new ArrayList<>();
        this.directedEdgeNeighbours = new ArrayList<>();
        this.undirectedEdgeNeighbours = new ArrayList<>();
    }

    /**
     * Copy constructor for the Node class.
     * The copy constructor does not copy across neighbouring nodes or neighbouring edges
     * as it is unnecessary and should only be populated if necessary for analysis
     *
     * @param n This is the Node that is being copied.
     */
    public Node(Node n) {
        this.label = n.label;
        this.id = n.id;
        ArrayList<Anchors> anch = null;
        if (n.getAnchors()!=null) {
            anch = new ArrayList<Anchors>();
            for (Anchors anchor : n.getAnchors()) {
                anch.add(new Anchors(anchor.getFrom(), anchor.getEnd()));
            }
        }
        this.anchors = anch;
        this.undirectedEdgeNeighbours = new ArrayList<>();
        this.directedEdgeNeighbours = new ArrayList<>();
        this.directedNeighbours = new ArrayList<>();
        this.undirectedNeighbours = new ArrayList<>();
        this.surface = n.surface;
    }

    /**
     * Getter method for the Node's ID number.
     * @return Integer The Node's ID number.
     */
    public String getId() {
        return id;
    }



    public void setId(String id) {
        this.id = id;
    }


    public void setCharacterSpans(ArrayList<Anchors> characterSpans) {
        this.characterSpans = characterSpans;
    }

    public ArrayList<Anchors> getCharacterSpans() {
        return characterSpans;
    }

    public String getLabel() {
        return label;
    }


    public void setLabel(String label) {
        this.label = label;
    }


    public ArrayList<Anchors> getAnchors() {
        return anchors;
    }


    public void setAnchors(ArrayList<Anchors> anchors) {
        this.anchors = anchors;
    }

    public ArrayList<String> getProperties() {
        return properties;
    }

    public ArrayList<String> getValues() {
        return values;
    }

    public void setProperties(ArrayList<String> properties) {
        this.properties = properties;
    }

    public void setValues(ArrayList<String> values) {
        this.values = values;
    }


    public boolean isSurface() {
        return surface;
    }

    @JsonIgnore
    public void setSurface(boolean surface) {
        this.surface = surface;
    }

    /**
     * Adds a directed neighbouring Node. i.e a Node that this Node points to.
     * @param neighbour A direct neighbouring Node.
     */
    public void addDirectedNeighbour(Node neighbour) {
        directedNeighbours.add(neighbour);
    }

    /**
     * Adds an undirected neighbouring Node. i.e a Node that points to this Node.
     * @param neighbour An undirected neighbouring Node.
     */
    public void addUndirectedNeighbour(Node neighbour) {
        undirectedNeighbours.add(neighbour);
    }

    /**
     * Getter method for a Node's directed neighbours.
     * @return ArrayList The Node's direct neighbours.
     */
    public ArrayList<Node> getDirectedNeighbours() {
        return directedNeighbours;
    }

    /**
     * Getter method for a Node's undirected neighbours.
     * @return ArrayList The Node's undirected neighbours.
     */
    public ArrayList<Node> getUndirectedNeighbours() {
        return undirectedNeighbours;
    }


    /**
     * Getter method for DirectedEdgeNeighbours.
     *
     * @return ArrayList A list of the edges connected from this Node to other nodes.
     */
    public ArrayList<Edge> getDirectedEdgeNeighbours() {
        return directedEdgeNeighbours;
    }


    /**
     * Adds an Edge to the DirectedEdgeNeighbours ArrayList
     *
     * @param e This is the Edge that will be added to the DirectedEdgeNeighbours ArrayList
     */
    public void addDirectedEdgeNeighbour(Edge e) {
        directedEdgeNeighbours.add(e);
    }

    /**
     * Getter method for UndirectedEdgeNeighbours.
     *
     * @return ArrayList A List of the edges that connect from other nodes to this Node
     */
    public ArrayList<Edge> getUndirectedEdgeNeighbours() {
        return undirectedEdgeNeighbours;
    }


    /**
     * Adds an Edge to the UndirectedEdgeNeighbours ArrayList
     *
     * @param e This is the Edge that will be added to the UndirectedEdgeNeighbours ArrayList
     */
    public void addUndirectedEdgeNeighbour(Edge e) {
        undirectedEdgeNeighbours.add(e);
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

        if (!(o instanceof Node)) {
            return false;
        }

        Node n = (Node) o;
        return ((id == n.getId()) && (label.equals(n.getLabel())) && (anchors.equals(n.getAnchors())));
    }


    public boolean isDummy() {
        return dummy;
    }

    public void setDummy(boolean dummy) {
        this.dummy = dummy;
    }
}
