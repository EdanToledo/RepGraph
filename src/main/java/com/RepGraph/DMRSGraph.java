package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.util.*;

/**
 * The Graph class represents a single sentence which comprises of nodes, edges and tokens.
 */
public class DMRSGraph extends AbstractGraph {


    /**
     * Default constructor for the Graph class.
     */
    public DMRSGraph() {
        super();
    }


    public DMRSGraph(String id, String source, String input, HashMap<String, Node> nodes, ArrayList<Token> tokens, ArrayList<Edge> edges, String top) {
        super(id, source, input, nodes, edges,tokens, top);

    }

}
