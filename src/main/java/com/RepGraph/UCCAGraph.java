package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * The UCCA Graph class represents a graph following the UCCA Framework
 */
public class UCCAGraph extends AbstractGraph {


    /**
     * Default constructor for the Graph class.
     */
    public UCCAGraph() {
        super();
    }

    @JsonCreator
    public UCCAGraph(@JsonProperty("id") String id, @JsonProperty("source") String source, @JsonProperty("input") String input, @JsonProperty("nodes") ArrayList<Node> nodes, @JsonProperty("edges") ArrayList<Edge> edges, @JsonProperty("tops") ArrayList<Integer> top) {
        this.id = id;
        this.source = source;
        this.input = input;
        this.edges = edges;
        for (Node n : nodes) {
            ArrayList<Anchors> characterSpans = null;
            if (n.getAnchors()!=null){
                characterSpans = new ArrayList<>();
                for (Anchors a:n.getAnchors()) {
                    Anchors AnchChar = new Anchors(a.getFrom(),a.getEnd());
                    characterSpans.add(AnchChar);
                }}
            n.setCharacterSpans(characterSpans);
            this.nodes.put(n.getId(), n);
        }
        this.setNodeNeighbours();
        this.top = top.get(0) + "";
        this.setNodeSpans(this.nodes.get(this.top));
        for (Node n : this.nodes.values()) {
            if (n.isSurface()) {
                String label = "";
                for (Anchors anch : n.getAnchors()) {
                    label += " "+this.input.substring(anch.getFrom(), anch.getEnd());
                }
                n.setLabel(label);
            } else {
                n.setLabel("");
            }
        }
        populateTokens();

    }

    /**
     * Assigns implicit UCCA spans of abstract nodes using the union of their descendents
     * @param root Node to start traversal
     */
    public void setNodeSpans(Node root) {

        if (root.getAnchors() == null) {
            root.setSurface(false);
            int min = Integer.MAX_VALUE;
            int max = Integer.MIN_VALUE;
            for (Node n : root.getDirectedNeighbours()) {
                if (n.getAnchors() == null) {
                    setNodeSpans(n);
                } else {
                    n.setSurface(true);
                }
                for (Anchors anch : n.getAnchors()) {
                    min = Math.min(min, anch.getFrom());
                    max = Math.max(max, anch.getEnd());
                }
            }

            Anchors anch = new Anchors(min, max);
            ArrayList<Anchors> arrAnch = new ArrayList<>();
            arrAnch.add(anch);
            root.setAnchors(arrAnch);

        }

    }


}
