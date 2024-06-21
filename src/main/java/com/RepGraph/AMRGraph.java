package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.process.PTBTokenizer;

import javax.swing.text.StyledEditorKit;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Stack;

/**
 * The AMR Graph class represents a graph following the AMR Framework
 */
public class AMRGraph extends AbstractGraph {

    @JsonIgnore
    boolean beenProcessed = false;

    /**
     * Default constructor for the Graph class.
     */
    public AMRGraph() {
        super();
    }

    /**
     * Utility function used in the process of aligning nodes to tokens using the JAMR aligner
     */
    public void alignUtil(String NodeID, HashMap<String, Node> nodes, HashMap<String, Boolean> visited, int layer, StringWriter writer) throws IOException {
        // Mark the current node as visited and print it
        visited.put(NodeID, true);

        Iterator<Node> i = nodes.get(NodeID).getDirectedNeighbours().iterator();
        Iterator<Edge> ie = nodes.get(NodeID).getDirectedEdgeNeighbours().iterator();

        if (i.hasNext()) {
            layer += 1;
        }
        while (i.hasNext()) {
            String n = i.next().getId();
            String ne = ie.next().getLabel();
            writer.write(" :" + ne + " ( v" + n + " / " + nodes.get(n).getLabel() + " ");
            if (!visited.get(n)) {
                alignUtil(n, nodes, visited, layer, writer);
            } else {
                writer.write(")");
            }
        }
        writer.write(")");

    }

    /**
     * Aligns nodes to tokens
     * @throws IOException
     * @throws InterruptedException
     */
    public void alignNodes() throws IOException, InterruptedException {
        setNodeNeighbours();

        if (beenProcessed){
            return;
        }

        HashMap<String, Boolean> visited = new HashMap<>();
        for (String i : nodes.keySet()) {
            visited.put(i, false);
        }

        StringWriter myWriter = new StringWriter();


        myWriter.write("#::snt " + this.input + "\n");
        myWriter.write("(v" + this.top + " / " + nodes.get(this.top).getLabel() + " ");

        alignUtil(this.top, this.nodes, visited, 0, myWriter);

        String amr_graph = myWriter.toString();



        Process proc = Runtime.getRuntime().exec(new String[]{"python3", "supportScripts/align_AMR.py",""+amr_graph+""});
        proc.waitFor();
        BufferedReader input =
                new BufferedReader(new InputStreamReader(proc.getInputStream()));


        String line = null;
        String[] tokens = null;
        String[] ner_tags = null;
        String[] ner_iob_tags = null;
        String[] pos_tags = null;
        String[] lemmas = null;


        while ((line = input.readLine()) != null) {

            if (line.startsWith("v")) {
                String nodeid = line.substring(1, line.indexOf(" "));
                int from = Integer.parseInt(line.substring(line.indexOf("(") + 1, line.indexOf(",")));
                int end = from;

                if (!line.substring(line.indexOf(",") + 1, line.indexOf(")")).equals("")) {
                    end = Integer.parseInt(line.substring(line.indexOf(",") + 1, line.indexOf(")")));
                }

                Anchors a = new Anchors(from, end);
                nodes.get(nodeid).setAnchors(new ArrayList<Anchors>());
                nodes.get(nodeid).getAnchors().add(a);
                nodes.get(nodeid).setSurface(true);

            }
            if (line.startsWith("###tokens")) {
                tokens = input.readLine().split("<###>");
            }
            if (line.startsWith("###ner_tags")) {
                ner_tags = input.readLine().split("<###>");
            }
            if (line.startsWith("###ner_iob_tags")) {
                ner_iob_tags = input.readLine().split("<###>");
            }
            if (line.startsWith("###pos_tags")) {
                pos_tags = input.readLine().split("<###>");
            }
            if (line.startsWith("###lemmas")) {
                lemmas = input.readLine().split("<###>");
            }
        }
        ArrayList<Token> tokenlist = new ArrayList<>();
        if (tokens!=null) {
            for (int i = 0; i < tokens.length; i++) {

                tokenlist.add(new Token(i, tokens[i], lemmas[i], null));
                tokenlist.get(i).getExtraInformation().put("NER", ner_tags[i]);
                tokenlist.get(i).getExtraInformation().put("NER_IOB", ner_iob_tags[i]);
                tokenlist.get(i).getExtraInformation().put("POS", pos_tags[i]);

            }
            setTokens(tokenlist);
        }
        beenProcessed = true;

    }

    @JsonSetter
    public void setNodes(ArrayList<Node> nodelist) {


        for (Node n : nodelist) {
            ArrayList<Anchors> characterSpans = null;
            if (n.getAnchors()!=null){
                n.setSurface(true);
                characterSpans = new ArrayList<>();
                for (Anchors a:n.getAnchors()) {
                    Anchors AnchChar = new Anchors(a.getFrom(),a.getEnd());
                    characterSpans.add(AnchChar);
                }}
            n.setCharacterSpans(characterSpans);
            this.nodes.put(n.getId(), n);
        }
        populateTokens();
    }

    /**
     * Overrided method to align nodes before calling planar method
     * @return planar data
     * @throws IOException
     * @throws InterruptedException
     */
    @JsonIgnore
    public HashMap<String,Object> isPlanar() throws IOException, InterruptedException {
        this.alignNodes();
        return super.isPlanar();
    }

}
