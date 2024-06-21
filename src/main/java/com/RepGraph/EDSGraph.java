package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;

/**
 * The EDS Graph class represents a graph following the EDS Framework
 */
public class EDSGraph extends AbstractGraph {


    /**
     * Default constructor for the EDS Graph class.
     */
    public EDSGraph() {
        super();
    }

    public EDSGraph(String id, String source, String input, HashMap<String, Node> nodes, ArrayList<Token> tokens, ArrayList<Edge> edges, String top) {
        super(id, source, input, nodes, edges,tokens, top);

    }

    /**
     * Set the hashmap of nodes from an array of nodes - uses EDS specific rules
     * @param nodelist Array of Node objects
     */
    @JsonSetter("nodes")
    public void setNodes(ArrayList<Node> nodelist) {

        //Dont understand the CARG property thing
        for (Node n : nodelist) {
            ArrayList<Anchors> characterSpans = null;
            if (n.getAnchors()!=null){
                characterSpans = new ArrayList<>();
                for (Anchors a:n.getAnchors()) {
                    Anchors AnchChar = new Anchors(a.getFrom(),a.getEnd());
                    characterSpans.add(AnchChar);
                }}
            n.setCharacterSpans(characterSpans);

            if (n.getLabel().startsWith("_") || (n.getProperties()!=null && n.getProperties().contains("CARG")) ){n.setSurface(true);}else{n.setSurface(false);}
            this.nodes.put(n.getId(), n);
        }
        populateTokens();
    }

}
