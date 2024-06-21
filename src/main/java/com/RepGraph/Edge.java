/**
 * Edge class used to represent relations between nodes in a Graph.
 *
 * @since 29/08/2020
 */


package com.RepGraph;

import com.fasterxml.jackson.annotation.*;

import java.util.ArrayList;

@JsonIgnoreProperties(value = {"id"})
public class Edge {

    /**
     * ID of the Node that is the source of the Edge.
     */
    @JsonAlias({"from","source"})
    private String source;

    /**
     * ID of the Node that is the target of the Edge.
     */
    @JsonAlias({"to","target"})
    private String target;

    /**
     * The Edge's label.
     */
    @JsonAlias({"label","rargname"})
    private String label;

    /**
     * The Edge's post label.
     */
    @JsonAlias({"post-label","post"})
    private String postLabel;


    @JsonProperty("normal")
    private String normal;

    private ArrayList<String> attributes;

    private ArrayList<String> values;
    /**
     * Default constructor of the Edge class.
     */

    public Edge() {
    }

    /**
     * The Parameterised copy constructor of the Edge class
     *
     * @param e This is the Edge object that is copied.
     */
    public Edge(Edge e) {
        this.target = e.target;
        this.source = e.source;
        this.label = e.label;
        this.postLabel = e.postLabel;
    }

    /**
     * Fully parameterised constructor of the Edge class.
     * @param source Number of the Node that is the source of the Edge.
     * @param target Number of the Node that is the target of the Edge.
     * @param label The Edge's label.
     * @param postLabel Default constructor of the Edge class.
     */
    public Edge(String source, String target, String label, String postLabel) {
        this.source = source;
        this.target = target;
        this.label = label;
        this.postLabel = postLabel;
    }

    /**
     * Getter method for the source Node.
     * @return Integer Number of the source Node.
     */

    public String getSource() {
        return source;
    }

    /**
     * Setter method for the source Node.
     * @param source Number of the source Node.
     */

    public void setSource(String source) {
        this.source = source;
    }



    public void setSource(int source) {
        this.source = source+"";
    }


    public String getTarget() {
        return target;
    }


    public void setTarget(String target) {
        this.target = target;
    }


    public void setTarget(int target) {
        this.target = target+"";
    }


    public String getLabel() {
        return label;
    }


    public void setLabel(String label) {
        this.label = label;
    }

    /**
     * Getter for the Edge's post label.
     * @return String The Edge's post label.
     */
    public String getPostLabel() {
        return postLabel;
    }

    /**
     * Setter method for the Edge's post label.
     * @param postLabel The Edge's post label.
     */
    public void setPostLabel(String postLabel) {
        this.postLabel = postLabel;
    }

    public String getNormal() {
        return normal;
    }

    public void setNormal(String normal) {
        this.normal = normal;
    }

    public void setValues(ArrayList<String> values) {
        this.values = values;
    }

    public ArrayList<String> getValues() {
        return values;
    }

    public ArrayList<String> getAttributes() {
        return attributes;
    }

    public void setAttributes(ArrayList<String> attributes) {
        this.attributes = attributes;
    }

    /**
     * Equals method for the Edge class.
     * @param o Object
     * @return boolean Whether to two classes being compared are equal.
     */
    @Override
    public boolean equals(Object o) {

        if (o == this) {
            return true;
        }

        if (!(o instanceof Edge)) {
            return false;
        }

        Edge e = (Edge) o;


        return ((source == e.getSource()) && (target == e.getTarget()) && (label.equals(e.getLabel())) && (postLabel.equals(e.getPostLabel())));
    }

}
