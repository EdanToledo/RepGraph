package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonSetter;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * The PTG Graph class represents a graph following the PTG Framework
 */
public class PTGGraph extends AbstractGraph {



    public PTGGraph() {
        super();
    }

    public PTGGraph(String id, String source, String input, HashMap<String, Node> nodes, ArrayList<Token> tokens, ArrayList<Edge> edges, String top) {
        super(id, source, input, nodes, edges,tokens, top);

    }

    /**
     * Sets the nodes hashmap from an array of node objects - uses PTG specific rules
     * @param nodelist Array of Node objects
     */
    @JsonSetter("nodes")
    public void setNodes(ArrayList<Node> nodelist) {

        for (Node n : nodelist) {
            ArrayList<Anchors> characterSpans = null;
            if (n.getAnchors()!=null){
                characterSpans = new ArrayList<>();
                for (Anchors a:n.getAnchors()) {
                    Anchors AnchChar = new Anchors(a.getFrom(),a.getEnd());
                    characterSpans.add(AnchChar);
                }}
            n.setCharacterSpans(characterSpans);

            if (n.getLabel()!=null){
            if (n.getLabel().startsWith("#")){
                n.setSurface(false);
            }else{n.setSurface(true);}

        }
            this.nodes.put(n.getId(), n);
        }
        ArrayList<Anchors> anchArr = new ArrayList<>();
        Anchors anchors = new Anchors(0,this.input.length());
        anchArr.add(anchors);

        this.nodes.get("0").setAnchors(anchArr);
        this.nodes.get("0").setLabel("#0");

        populateTokens();
    }
}
