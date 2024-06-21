package com.RepGraph;

import com.fasterxml.jackson.annotation.*;
import edu.stanford.nlp.ie.util.RelationTriple;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.pipeline.CoreDocument;
import edu.stanford.nlp.pipeline.CoreSentence;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.process.CoreLabelTokenFactory;
import edu.stanford.nlp.process.LexedTokenFactory;
import edu.stanford.nlp.process.PTBTokenizer;
import edu.stanford.nlp.semgraph.SemanticGraph;
import edu.stanford.nlp.trees.Tree;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The Graph class represents a single sentence which comprises of nodes, edges and tokens.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
class AbstractGraph {


    /**
     * The Graph's ID number.
     */
    protected String id;

    /**
     * The Graph's source.
     */
    protected String source;

    /**
     * The Graph's input/sentence.
     */
    protected String input;

    protected ArrayList<Token> tokens;

    @JsonProperty("nodes")
    protected HashMap<String, Node> nodes;

    @JsonProperty("edges")
    protected ArrayList<Edge> edges;

    @JsonProperty("tops")
    protected String top;

    /**
     * Default constructor for the Graph class.
     */
    public AbstractGraph() {
        this.edges = new ArrayList<>();
        this.nodes = new HashMap<>();
        this.tokens = new ArrayList<>();
    }

    /**
     * parameterised constructor for the Graph class that takes in the Node's Hashmap instead of the linear nodeslist
     * and populates the nodeslist from the hashmap information.
     *
     * @param id     The Graph's ID number.
     * @param source The Graph's source.
     * @param input  The Graph's input/sentence.
     * @param edges  An array list of the Graph's edges.
     */
    public AbstractGraph(String id, String source, String input, HashMap<String, Node> nodes, ArrayList<Edge> edges, ArrayList<Token> tokens, String top) {
        this.id = id;
        this.source = source;
        this.input = input;

        this.nodes = nodes;
        this.tokens = tokens;
        this.edges = edges;
        this.top = top;

    }

    /**
     * Getter method for the Graph's ID number.
     *
     * @return String The Graph's ID number.
     */
    public String getId() {
        return id;
    }

    /**
     * Setter method for the Graph's ID number.
     *
     * @param id The Graph's ID number.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Getter method for the Graph's source.
     *
     * @return String The Graph's source.
     */
    public String getSource() {
        return source;
    }

    /**
     * Setter method for the Graph's source.
     *
     * @param source The Graph's source.
     */
    public void setSource(String source) {
        this.source = source;
    }

    /**
     * Getter method for the Graph's input.
     *
     * @return String The Graph's input.
     */
    public String getInput() {
        return input;
    }

    /**
     * Setter method for the Graph's input.
     *
     * @param input The Graph's input.
     */
    public void setInput(String input) {
        this.input = input;
    }

    /**
     * Getter method for the Graph's edges.
     *
     * @return ArrayList The Graph's edges.
     */
    public ArrayList<Edge> getEdges() {
        return edges;
    }

    /**
     * Setter method for the Graph's edges.
     *
     * @param edges The Graph's edges.
     */
    public void setEdges(ArrayList<Edge> edges) {
        this.edges = edges;
    }


    public ArrayList<Token> getTokens() {
        return tokens;
    }


    public void setTokens(ArrayList<Token> tokens) {
        this.tokens = tokens;
    }

    public ArrayList<Token> extractTokensFromNodes() {
        Properties props = new Properties();
        // set the list of annotators to run
        props.setProperty("annotators", "tokenize, ssplit, pos, lemma");
        // build pipeline
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
        // create a document object
        CoreDocument doc = new CoreDocument(this.input);
        // annotate
        pipeline.annotate(doc);
        ArrayList<Token> tokenlist = new ArrayList<>();
        int index = 0;
        for (CoreLabel tok : doc.tokens()) {
            tokenlist.add(new Token(index, tok.originalText(), tok.lemma(), null));
            for (Node n : this.nodes.values()) {
                if (n.getAnchors() == null) {
                    continue;
                }
                for (Anchors a : n.getAnchors()) {
                    if (a.getFrom() == tok.beginPosition()) {
                        a.setFrom(index);
                    }
                    if (a.getEnd() == tok.endPosition()) {
                        a.setEnd(index);
                    }
                }
            }
            index++;
        }

        return tokenlist;

    }


    public String getTop() {
        return top;
    }

    public void setTopString(String top) {
        this.top = top;
    }

    @JsonSetter("tops")
    public void setTopArray(ArrayList<Integer> top) {
        this.top = top.get(0) + "";
    }


    @JsonGetter("nodes")
    public ArrayList<Node> returnNodeInArrayList() {
        ArrayList<Node> returnNodes = new ArrayList<Node>();
        ArrayList<Node> noAnchors = new ArrayList<>();
        for (Node n : this.nodes.values()) {
            if (n.getAnchors()==null){
                noAnchors.add(n);
            }else{
                returnNodes.add(n);
            }

        }
        Collections.sort(returnNodes, new Comparator<Node>() {
            @Override
            public int compare(Node o1, Node o2) {

                if (o1.getAnchors().get(0).getFrom() < o2.getAnchors().get(0).getFrom()) {
                    return -1;
                } else if (o1.getAnchors().get(0).getFrom() == o2.getAnchors().get(0).getFrom()) {
                    if (o1.getAnchors().get(0).getEnd() < o2.getAnchors().get(0).getEnd()) {
                        return -1;
                    } else if (o1.getAnchors().get(0).getEnd() == o2.getAnchors().get(0).getEnd()) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
                return 1;
            }
        });
        returnNodes.addAll(noAnchors);
        return returnNodes;
    }

    @JsonIgnore
    public HashMap<String, Node> getNodes() {
        return this.nodes;
    }

    @JsonSetter("nodes")
    public void setNodes(ArrayList<Node> nodelist) {

        for (Node n : nodelist) {
            this.nodes.put(n.getId(), n);
            ArrayList<Anchors> characterSpans = null;
            if (n.getAnchors()!=null){
                characterSpans = new ArrayList<>();
            for (Anchors a:this.nodes.get(n.getId()).getAnchors()) {
                Anchors AnchChar = new Anchors(a.getFrom(),a.getEnd());
                characterSpans.add(AnchChar);
            }}

            this.nodes.get(n.getId()).setCharacterSpans(characterSpans);
            if (this.nodes.get(n.getId()).getLabel().startsWith("_")){
                this.nodes.get(n.getId()).setSurface(true);
            }
        }
        populateTokens();
    }

    @JsonIgnore
    public void setNodes(HashMap<String, Node> nodes) {

        this.nodes = nodes;
    }

    public void populateTokens() {

        if (tokens.size() == 0) {
            setTokens(extractTokensFromNodes());
        }
    }

    /**
     * Creates a list of tokens in a range starting at "from" and ending at "end"
     *
     * @param from The start of the range of tokens
     * @param end  The End of the range of tokens
     * @return ArrayList<Token> Returns a list of Token objects
     */
    public ArrayList<Token> getTokenSpan(int from, int end) {
        ArrayList<Token> returnTokens = new ArrayList<>();
        for (int i = from; i < end + 1; i++) {
            returnTokens.add(tokens.get(i));
        }
        return returnTokens;
    }

    /**
     * gets the "form" of tokens and turns them into a string
     *
     * @param tokenIn List of tokens to become a string
     * @return String This is the string of all Token's form.
     */
    public String getTokenInput(ArrayList<Token> tokenIn) {
        String output = "";

        for (Token t : tokenIn) {
            output += " " + t.getForm();

        }

        return output.trim();
    }

    /**
     * This method checks to see if a Graph has a dangling Edge i.e an Edge that doesnt connect to any Node
     *
     * @return boolean returns true if the Graph has a dangling Edge otherwise returns false.
     */
    public boolean hasDanglingEdge() {
        for (Edge e : edges) {
            if (!nodes.containsKey(e.getTarget()) || !nodes.containsKey(e.getSource())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Assigns all the nodes in the Graph their directed and undirected neighbouring nodes, which will be used for analysis.
     */
    public void setNodeNeighbours() {
        String source;
        String target;

        if (edges.size() == 0) {
            //Graph has no edges
            return;
        } else {

            source = edges.get(0).getSource();

            if (!nodes.containsKey(source) || nodes.get(source).getDirectedNeighbours().size() != 0) {
                //Node neighbours have already been set
                return;
            }
        }

        //Iterate through each Edge and set the corresponding Node's thier neighbours.
        for (int i = 0; i < edges.size(); i++) {

            Edge currentEdge = edges.get(i);

            source = currentEdge.getSource();
            target = currentEdge.getTarget();

            Node sourceNode = nodes.get(source);
            sourceNode.addDirectedNeighbour(nodes.get(target));
            nodes.get(target).addUndirectedNeighbour(sourceNode);
            if (!sourceNode.getDirectedEdgeNeighbours().contains(currentEdge)) {
                sourceNode.addDirectedEdgeNeighbour(currentEdge);
            }

            nodes.get(target).addUndirectedEdgeNeighbour(currentEdge);

        }

    }

    /**
     * Combines the directed and undirected Node neighbours of a given Node.
     *
     * @param nodeID The ID of the Node.
     * @return ArrayList<Node> List of the Node's directed and undirected neighbours.
     */
    public ArrayList<Node> combineNeighbours(String nodeID) {
        ArrayList<Node> allNeighbours = new ArrayList<>(nodes.get(nodeID).getDirectedNeighbours());
        ArrayList<Node> undirectedNeighbours = new ArrayList<>(nodes.get(nodeID).getUndirectedNeighbours());
        //Adds all a Node's undirected neighbours and its directed neighbours together.
        allNeighbours.addAll(undirectedNeighbours);
        return allNeighbours;
    }


    /**
     * Analysis Tool for finding the longest paths in the Graph.
     *
     * @param directed This is the boolean to decide if the longest path found is directed or undirected.
     * @return ArrayList<ArrayList < Integer>> The a list of longest paths in the Graph.
     */
    public ArrayList<ArrayList<String>> findLongest(boolean directed) {

        //Ensure that all Graph Node's have their neighbours assigned
        setNodeNeighbours();

        ArrayList<ArrayList<String>> paths = new ArrayList<>();

        if ((nodes.size() == 0) || (edges.size() == 0)) { //No edges or nodes in Graph i.e. path is empty.

            return paths;

        } else if (edges.size() == 1) {//Only 1 Edge in the Graph i.e. path is the source Node to the target Node of the Edge

            paths.add(new ArrayList<>());
            paths.get(0).add(edges.get(0).getSource());
            paths.get(0).add(edges.get(0).getTarget());
            return paths;

        } else {

            if (!directed) {

                if (connectedBFS(nodes.values().iterator().next().getId())) {
                    //Finding the longest path in a undirected connected Graph.

                    //Find the longest paths from the first Node in the Graph.
                    ArrayList<ArrayList<String>> endpoints = BFS(nodes.values().iterator().next().getId());
                    ArrayList<ArrayList<String>> temp;
                    ArrayList<String> pathEnds = new ArrayList<>();

                    //Iterate through each path's end points (which is in position 0 as the path is reversed)
                    for (ArrayList<String> end : endpoints) {
                        if (!pathEnds.contains(end.get(0))) { //Avoids identical paths that are just reversed.
                            temp = BFS(end.get(0)); //Finds the true longest path from this particular end point.
                            for (ArrayList<String> al : temp) {//Add path to longest paths.
                                paths.add(new ArrayList<>(al));
                                pathEnds.add(al.get(0));
                            }
                        }
                    }
                } else { //Finding the longest path in a undirected disconnected Graph.

                    //Default longest path set from the first Node in the Graph.
                    ArrayList<ArrayList<String>> longest;
                    longest = BFS(nodes.values().iterator().next().getId());

                    //Add longest paths to the overall longest paths
                    for (ArrayList<String> al : longest) {
                        paths.add(al);
                    }

                    ArrayList<ArrayList<String>> temp;

                    //Makes each Node the start Node and compared the longest paths found from that Node to the current best longest path.
                    for (String i : nodes.keySet()) {
                        temp = BFS(i);

                        if (temp.size() != 0) {
                            if ((longest.size() == 0) || (temp.get(0).size() > longest.get(0).size())) {//New path is longest than the current longest path, so overwrite the overall longest paths
                                longest = temp;
                                paths.clear();
                                for (ArrayList<String> al : temp) {
                                    paths.add(new ArrayList<>(al));
                                }
                            } else if (temp.get(0).size() == longest.get(0).size()) {//New path is the same length as the current longest path, so add it to the overall longest paths
                                for (ArrayList<String> al : temp) {
                                    paths.add(new ArrayList<>(al));
                                }
                            }
                        }
                    }

                    //Reverse the each of the longest paths so that they start with the smaller Node ID. Removes duplicate but reversed paths as well.
                    ArrayList<ArrayList<String>> newPaths = new ArrayList<>();
                    for (ArrayList<String> al : paths) {
                        if (!newPaths.contains(al)) {
                            Collections.reverse(al);
                            if (!newPaths.contains(al)) {
                                newPaths.add(al);
                            }
                        }
                    }
                    return newPaths;
                }
            } else {//Finding the longest path in a directed Graph.

                //Default longest path set from first Node in the Graph.
                ArrayList<ArrayList<String>> longest;
                Set<String> nodesInPath = new HashSet<>(); //Keeps track of all nodes in the overall longest path.
                longest = directedLongestPaths(nodes.values().iterator().next().getId());

                //Add longest paths to the overall longest paths
                for (ArrayList<String> integers : longest) {
                    paths.add(integers);
                    for (String n : integers) {
                        nodesInPath.add(n);
                    }
                }

                ArrayList<ArrayList<String>> temp;

                //Makes each Node the start Node and finds the longest overall path/s.
                for (String i : nodes.keySet()) {
                    if (!nodesInPath.contains(i)) {//Cuts processing time by not letting a Node already in the overall longest path be a start Node, as the longest path from that Node will never yield a longer path than the current overall longest path.
                        temp = directedLongestPaths(i);

                        if (temp.size() != 0) {
                            if ((longest.size() == 0) || (temp.get(0).size() > longest.get(0).size())) {//New path is longest than the current longest path, so overwrite the overall longest paths
                                longest = temp;
                                paths.clear();
                                for (ArrayList<String> al : temp) {
                                    paths.add(new ArrayList<>(al));
                                    for (String n : al) {
                                        nodesInPath.add(n);
                                    }
                                }
                            } else if (temp.get(0).size() == longest.get(0).size()) {//New path is the same length as the current longest path, so add it to the overall longest paths
                                for (ArrayList<String> al : temp) {
                                    paths.add(new ArrayList<>(al));
                                    for (String n : al) {
                                        nodesInPath.add(n);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //Reverses the path so that start Node is first.
            for (ArrayList<String> item : paths) {
                Collections.reverse(item);
            }

            return paths;
        }

    }

    /**
     * Breadth First Search algorithm for determining whether a Graph is connected or not.
     *
     * @return boolean Whether the Graph is connected or not.
     */
    public boolean connectedBFS(String startNodeID) {

        setNodeNeighbours();


        if (nodes.size() <= 1) { //If there is only 1 Node or less, then the Graph is connected
            return true;
        }

        //Creates a list of all directed and undirected neighbours of the start Node.
        ArrayList<Node> allNeighbours = combineNeighbours(startNodeID);

        //Checks to see if the Node has any neighbours, if not, return false
        if (allNeighbours.size() == 0) {
            return false;
        }


        HashMap<String, Integer> dist = new HashMap<>();//HashMap to keep track of each Node's distance from start Node

        //All distances from start Node start at -1, except the start Node.
        for (String i : nodes.keySet()) {
            dist.put(i, -1);
        }
        dist.put(startNodeID, 0);

        int nodesVisited = 0;

        Queue<String> q = new LinkedList<>();
        q.add(startNodeID);

        //Iterate through the queue of nodes until it is empty.
        while (!q.isEmpty()) {
            String currentNodeID = q.poll();
            nodesVisited++;

            //Combine the lists of all directed and undirected neighbours of the current Node.
            allNeighbours = combineNeighbours(currentNodeID);

            //Iterate through all neighbouring nodes
            for (int i = 0; i < allNeighbours.size(); i++) {
                String neighbourNodeID = allNeighbours.get(i).getId();

                if (dist.get(neighbourNodeID) == -1) {//Check if the Node is unvisited. If so, add it to the queue and update its distance.
                    q.add(neighbourNodeID);
                    dist.put(neighbourNodeID, dist.get(currentNodeID) + 1);
                }
            }
        }

        if (nodesVisited < nodes.size()) { //If there were any unvisited nodes then the Graph is not connected
            return false;
        } else {
            return true;
        }
    }

    /**
     * Checks if a directed or an undirected Graph is cyclic or not by calling on the appropriate recursive function required.
     *
     * @param directed Boolean to see if the Graph is directed or not.
     * @return Boolean If the Graph is cyclic or not.
     */
    public boolean isCyclic(boolean directed) {

        setNodeNeighbours();

        //Mark nodes as unvisited and not in the stack (stack is for directed graphs only)
        HashMap<Node, Boolean> visited = new HashMap<>();
        HashMap<Node, Boolean> stack = new HashMap<>();
        for (Node n : nodes.values()) {
            visited.put(n, false);
            stack.put(n, false);
        }

        if (directed) {
            //Call recursive function to detect cycles in different DFS directed trees.
            for (Node n : nodes.values()) {
                if (isCyclicCheckerDirected(n, visited, stack)) {
                    return true;
                }
            }
        } else {
            //Call recursive function to detect cycles in different DFS undirected trees.
            for (Node n : nodes.values()) {
                if (!visited.get(n)) { //Check if the Node hasn't already been visited
                    if (isCyclicCheckerUndirected(n, visited, -1 + "")) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Recursive function that checks for cycles in an undirected Graph.
     *
     * @param v       The current Node.
     * @param visited A HashMap of Node to boolean to keep track of which nodes have been visited already.
     * @param parent  The ID of the parent Node of the current Node.
     * @return Boolean If the Graph is cyclic or not.
     */
    public boolean isCyclicCheckerUndirected(Node v, HashMap<Node, Boolean> visited, String parent) {

        //Set the current Node as visited.
        visited.put(v, true);

        //Iterate through all the current Node's neighbouring nodes
        for (Node neighbour : combineNeighbours(v.getId())) {
            if (!visited.get(neighbour)) { //If the neighbour is unvisited
                if (isCyclicCheckerUndirected(neighbour, visited, v.getId())) {
                    return true;
                }
                ;
            } else if (!neighbour.getId().equals(parent)) { //If the neighbouring is visited and not a parent of the current Node, then there is a cycle.
                return true;
            }
        }

        return false;
    }

    /**
     * Recursive function that checks for cycles in an directed Graph.
     *
     * @param v       The current Node.
     * @param visited A HashMap of Node to boolean to keep track of which nodes have been visited already.
     * @param stack   A HashMap of Node to boolean to keep track of which nodes have been added to the stack.
     * @return Boolean If the Graph is cyclic or not.
     */
    public boolean isCyclicCheckerDirected(Node v, HashMap<Node, Boolean> visited, HashMap<Node, Boolean> stack) {

        //Check if the Node is in the stack already.
        if (stack.get(v)) {
            return true;
        }

        // Check if the Node has already been visited.
        if (visited.get(v)) {
            return false;
        }

        //Set stack and visited to true.
        stack.put(v, true);
        visited.put(v, true);

        //Iterate through the Node's directed neighbours and call recursive function.
        for (Node neighbour : v.getDirectedNeighbours()) {
            if (isCyclicCheckerDirected(neighbour, visited, stack)) {
                return true;
            }
        }

        stack.put(v, false);

        return false;
    }

    /**
     * Finds the longest paths from a given start Node to all the other nodes in the system and returns the paths of the longest paths.
     *
     * @param startNodeID Number of the start Node.
     * @return ArrayList<ArrayList < Integer>> The longest paths available from the start Node.
     */
    public ArrayList<ArrayList<String>> directedLongestPaths(String startNodeID) {

        ArrayList<ArrayList<String>> paths = new ArrayList<>();

        //Check if the start Node has any neighbours, if not then return an empty path.
        if (nodes.get(startNodeID).getDirectedNeighbours().size() == 0) {
            return paths;
        }

        HashMap<String, Integer> dist = new HashMap<>(); //HashMap to keep track of each Node's distance from start Node
        HashMap<String, String> prevNode = new HashMap<>(); //HashMap to keep track of each Node's previous Node in the path

        //Set all nodes in the Graph to unvisited
        HashMap<String, Boolean> visited = new HashMap<>();
        for (String i : nodes.keySet()) {
            visited.put(i, false);
        }

        //Topologically sort every unvisited Node, which gets added to the stack.
        Stack<String> stack = new Stack<>();
        for (String i : nodes.keySet()) {
            if (!visited.get(i)) {
                topologicalSort(i, visited, stack);
            }
        }

        //Set all distances to NINF except the start Node.
        for (String i : nodes.keySet()) {
            dist.put(i, Integer.MIN_VALUE);
        }
        dist.put(startNodeID, 0);

        //Iterate through the stack to find longest path.
        while (!stack.empty()) {
            String u = stack.pop();

            if (dist.get(u) != Integer.MIN_VALUE) {
                for (Node n : nodes.get(u).getDirectedNeighbours()) {
                    if (dist.get(n.getId()) < dist.get(u) + 1) { //Check if the current distance is shorter than the new distance, if so update the distance and previous Node arrays.
                        dist.put(n.getId(), dist.get(u) + 1);
                        prevNode.put(n.getId(), u);
                    }
                }
            }
        }
        return traverseLongestPath(dist, prevNode, startNodeID);

    }

    /**
     * Recursive function that Topologically Sorts a Graph.
     *
     * @param nodeID  The current Node.
     * @param visited A Hashmap of integer keys and boolean values,
     *                representing whether a Node (represented by its ID in the key of the hashmap)
     *                has already been visited or not
     *                i.e if it has been visited the boolean value of the hashmap will be true.
     * @param stack   ?
     * @return Stack<Integer>
     */
    public Stack<String> topologicalSort(String nodeID, HashMap<String, Boolean> visited, Stack<String> stack) {
        visited.put(nodeID, true);

        //Iterate through every neighbouring Node of the given Node.
        for (Node neighbourNode : nodes.get(nodeID).getDirectedNeighbours()) {
            if (!visited.get(neighbourNode.getId())) { //If Node is unvisited then topologically sort it.
                topologicalSort(neighbourNode.getId(), visited, stack);
            }
        }

        stack.push(nodeID);
        return stack;
    }

    /**
     * Breadth First Search algorithm for finding the longest path from a given start Node in a Graph.
     *
     * @param startNodeID The starting Node ID.
     * @return ArrayList<ArrayList < Integer>>
     */
    public ArrayList<ArrayList<String>> BFS(String startNodeID) {

        ArrayList<ArrayList<String>> paths = new ArrayList<>();

        //Creates a list of all directed and undirected neighbours of the start Node.
        ArrayList<Node> allNeighbours = combineNeighbours(startNodeID);

        //Checks to see if the Node has any neighbours. If not, then return empty path.
        if (allNeighbours.size() == 0) {
            return paths;
        }

        HashMap<String, Integer> dist = new HashMap<>();//HashMap to keep track of each Node's distance from start Node

        // All distances from start Node start at -1, except the start Node.
        for (String i : nodes.keySet()) {
            dist.put(i, -1);
        }
        dist.put(startNodeID, 0);

        HashMap<String, String> prevNode = new HashMap<>();//HashMap to keep track of each Node's previous Node in the path

        Queue<String> q = new LinkedList<>();

        q.add(startNodeID);

        //Iterate through the queue of nodes until it is empty.
        while (!q.isEmpty()) {
            String currentNodeID = q.poll();

            //Combine the lists of all directed and undirected neighbours of the current Node.
            allNeighbours = combineNeighbours(currentNodeID);

            //Iterate through all neighbouring nodes.
            for (int i = 0; i < allNeighbours.size(); i++) {
                String neighbourNodeID = allNeighbours.get(i).getId();

                if (dist.get(neighbourNodeID) == -1) {//Check if the Node is unvisited. If so, add it to the queue, update its distance and its previous Node.
                    q.add(neighbourNodeID);
                    dist.put(neighbourNodeID, dist.get(currentNodeID) + 1);
                    prevNode.put(neighbourNodeID, currentNodeID);
                }
            }
        }

        return traverseLongestPath(dist, prevNode, startNodeID);
    }


    /**
     * Returns the longest paths given a list of distances and an array of each Node's previous Node in the path.
     *
     * @param dist        A HashMap<Integer, Integer> of each nodes maximum distance
     *                    with the Node's ID being the key and the maximum distance being the value.
     * @param prevNode    HashMap<Integer, Integer> of each Node's previous Node in a path
     *                    with the Node's ID being the key and the previous Node's ID being te value..
     * @param startNodeID The Node ID of the start Node.
     * @return ArrayList<ArrayList < Integer>> The longest paths.
     */
    public ArrayList<ArrayList<String>> traverseLongestPath(HashMap<String, Integer> dist, HashMap<String, String> prevNode,
                                                            String startNodeID) {

        ArrayList<ArrayList<String>> paths = new ArrayList<>();
        int max = Collections.max(dist.values()); //Find the longest distance in the distance array

        //Uses the prevNode ArrayList to find the path of the longest distance starting at the end Node.
        ArrayList<String> path = new ArrayList<>();
        for (String i : dist.keySet()) {
            if (dist.get(i) == max) { //i.e. a longest path
                path.clear();
                path.add(i);
                String prev = prevNode.get(i);
                while (!prev.equals(startNodeID)) {//Iterate through the previous Node array until you reach the start Node.
                    path.add(prev);
                    prev = prevNode.get(prev);
                }
                path.add(startNodeID);
                paths.add(new ArrayList<>(path)); //Add the path to the list of overall longest paths
            }
        }

        return paths;
    }

    @JsonIgnore
    public HashMap<String, Object> isPlanar() throws IOException, InterruptedException {

        ArrayList<Node> ordered = new ArrayList<>();
        HashMap<String, ArrayList<String>> dummyNodes = new HashMap<>();
        HashMap<Node,Node> dummyParents = new HashMap<>();

        //add the Node objects to a list
        for (Node n : nodes.values()) {
            if(n.getAnchors()!=null){
            ordered.add(new Node(n));}else{continue;}
            if (n.getAnchors().size() > 1) {
                dummyNodes.put(n.getId(), new ArrayList<String>());
                for (int i = 1; i < n.getAnchors().size(); i++) {
                    ArrayList<Anchors> anchs = new ArrayList<>();
                    anchs.add(n.getAnchors().get(i));
                    String uuid = UUID.randomUUID().toString();
                    Node dum = new Node(uuid, n.getLabel(),anchs);
                    dum.setSurface(n.isSurface());
                    dum.setDummy(true);
                    ordered.add(dum);
                    dummyNodes.get(n.getId()).add(uuid);
                    dummyParents.put(dum,n);
                }
            }
        }

        //order the nodes according to the beginning of their span
        Collections.sort(ordered, new Comparator<Node>() {
            @Override
            public int compare(Node o1, Node o2) {
                if (o1.getAnchors().get(0).getFrom() < o2.getAnchors().get(0).getFrom()) {
                    return -1;
                } else if (o1.getAnchors().get(0).getFrom() == o2.getAnchors().get(0).getFrom()) {
                    if (o1.getAnchors().get(0).getEnd() < o2.getAnchors().get(0).getEnd()) {
                        return -1;
                    } else if (o1.getAnchors().get(0).getEnd() == o2.getAnchors().get(0).getEnd()) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
                return 1;
            }
        });

        HashMap<String, String> nodeToToken = new HashMap<>();

        int index = 0;
        for (int i = 0; i < ordered.size() - 1; i++) {
            nodeToToken.put(ordered.get(i).getId(), index + "");
            if (!(ordered.get(i).getAnchors().get(0).getFrom() == ordered.get(i + 1).getAnchors().get(0).getFrom() && ordered.get(i).getAnchors().get(0).getEnd() == ordered.get(i + 1).getAnchors().get(0).getEnd())) {
                index++;
            }
        }
        nodeToToken.put(ordered.get(ordered.size() - 1).getId(), index + "");

        ArrayList<Edge> updated = new ArrayList<>();

        String source, target;

        //for all edges change the source and target to refer to their span beginning of the respective nodes
        for (Edge e : edges) {

            source = e.getSource();
            target = e.getTarget();
            if (nodeToToken.containsKey(source) && nodeToToken.containsKey(target)) {
                Edge newEdge = new Edge();

                newEdge.setSource(nodeToToken.get(source));
                newEdge.setTarget(nodeToToken.get(target));

                if (!nodeToToken.get(source).equals(nodeToToken.get(target))) {
                    updated.add(newEdge);
                }


                if (dummyNodes.containsKey(source)) {
                    for (String sourceID : dummyNodes.get(source)) {
                        newEdge = new Edge();
                        newEdge.setSource(nodeToToken.get(sourceID));
                        newEdge.setTarget(nodeToToken.get(target));
                        if (!nodeToToken.get(sourceID).equals(nodeToToken.get(target))) {
                            updated.add(newEdge);
                        }
                    }
                }

                if (dummyNodes.containsKey(target)) {
                    for (String targetID : dummyNodes.get(target)) {
                        newEdge = new Edge();
                        newEdge.setSource(nodeToToken.get(source));
                        newEdge.setTarget(nodeToToken.get(targetID));
                        if (!nodeToToken.get(source).equals(nodeToToken.get(targetID))) {
                            updated.add(newEdge);
                        }
                    }
                }
                if (dummyNodes.containsKey(source) && dummyNodes.containsKey(target)) {
                    for (String sourceID : dummyNodes.get(source)) {
                        for (String targetID : dummyNodes.get(target)) {
                            newEdge = new Edge();
                            newEdge.setSource(nodeToToken.get(sourceID));
                            newEdge.setTarget(nodeToToken.get(targetID));
                            if (!nodeToToken.get(sourceID).equals(nodeToToken.get(targetID))) {
                                updated.add(newEdge);
                            }
                        }
                    }
                }
            }
        }


        ArrayList<Integer> crossingEdges = new ArrayList<>();
        for (int i = 0; i < updated.size(); i++) {
            Edge e = updated.get(i);

            for (int j = 0; j < updated.size(); j++) {
                Edge other = updated.get(j);
                if (Math.min(Integer.parseInt((e.getSource())), Integer.parseInt((e.getTarget()))) < Math.min(Integer.parseInt((other.getSource())), Integer.parseInt((other.getTarget()))) && Math.min(Integer.parseInt((other.getSource())), Integer.parseInt((other.getTarget()))) < Math.max(Integer.parseInt((e.getSource())), Integer.parseInt((e.getTarget()))) && Math.max(Integer.parseInt((e.getSource())), Integer.parseInt((e.getTarget()))) < Math.max(Integer.parseInt((other.getSource())), Integer.parseInt((other.getTarget())))) {
                    if (!crossingEdges.contains(i)) {
                        crossingEdges.add(i);
                    }
                    if (!crossingEdges.contains(j)) {
                        crossingEdges.add(j);
                    }

                }

            }
        }

//WHY IS THIS HERE
        for (int i = 0; i < ordered.size() - 1; i++) {
            if (!(ordered.get(i).getAnchors().get(0).getFrom() == ordered.get(i + 1).getAnchors().get(0).getFrom() && ordered.get(i).getAnchors().get(0).getEnd() == ordered.get(i + 1).getAnchors().get(0).getEnd())) {
                ordered.get(i).setId(nodeToToken.get(ordered.get(i).getId()));
            }
        }

        int count = 0;
        int lastCount = -1;


        for (int i = 0; i < ordered.size() - 1; i++) {

            if (lastCount == count) {
                UUID uuid = UUID.randomUUID();
                ordered.get(i).setId(uuid + "");
            } else {
                ordered.get(i).setId(count + "");
            }

            lastCount = count;
            if (!(ordered.get(i).getAnchors().get(0).getFrom() == ordered.get(i + 1).getAnchors().get(0).getFrom() && ordered.get(i).getAnchors().get(0).getEnd() == ordered.get(i + 1).getAnchors().get(0).getEnd())) {
                count += 1;
            }

        }
        if (lastCount == count) {
            UUID uuid = UUID.randomUUID();
            ordered.get(ordered.size() - 1).setId(uuid + "");
        } else {
            ordered.get(ordered.size() - 1).setId(count + "");
        }

        for (Node n:dummyParents.keySet()) {
            int span =0;
            for (int i=0;i<dummyParents.get(n).getAnchors().size();i++){
                if(n.getAnchors().get(0).equals(dummyParents.get(n).getAnchors().get(i))){
                    span=i;
                    break;
                }
            }
            span++;
            n.setLabel(dummyParents.get(n).getLabel()+" (Positional ID:"+nodeToToken.get(dummyParents.get(n).getId())+" Span "+span+")");
        }



        HashMap<String, Object> returnInfo = new HashMap<>();

        HashMap<String, Object> planarVisualisation = new HashMap<>();
        planarVisualisation.put("id", this.getId());
        planarVisualisation.put("source", this.getSource());
        planarVisualisation.put("input", this.input);
        planarVisualisation.put("nodes", ordered);
        planarVisualisation.put("edges", updated);
        planarVisualisation.put("tokens", this.tokens);
        planarVisualisation.put("tops", this.top);
        planarVisualisation.put("crossingEdges", crossingEdges);
        returnInfo.put("planarForm", planarVisualisation);

        boolean planar = false;
        if (crossingEdges.isEmpty()) {
            planar = true;
        }


        returnInfo.put("planar", planar);

        return returnInfo;
    }


    @JsonIgnore
    public float getAverageSpanLength(){
        float val=0;
        for (Node n:this.nodes.values()){
            float span = 0;
            if (n.getAnchors()!=null){
                for (Anchors a:n.getAnchors()) {
                span+= a.getEnd()-a.getFrom()+1;

            }
            span/=n.getAnchors().size();
            }
            val+=span;
        }
        val/=this.nodes.values().size();
        return val;
    }

    @JsonIgnore
    public float getAverageEdgeLength() throws IOException, InterruptedException {
        float val=0;
        HashMap<String, Object> planarGraph = (HashMap<String, Object>) this.isPlanar().get("planarForm");
        ArrayList<Edge> newEdges = (ArrayList<Edge>) planarGraph.get("edges");
        for (Edge e:newEdges) {
            val += Math.abs(Integer.parseInt(e.getTarget())-Integer.parseInt(e.getSource()));
        }
        val/=newEdges.size();
        return val;
      }

    @Override
    public boolean equals(Object o) {

        if (o == this) {
            return true;
        }

        if (!(o instanceof AbstractGraph)) {
            return false;
        }

        AbstractGraph g = (AbstractGraph) o;


        return ((id.equals(g.getId())) && (source.equals(g.getSource())) && (input.equals(g.getInput())) && (nodes.equals(g.getNodes())) && (tokens.equals(g.getTokens())) && (edges.equals(g.getEdges())) && top.equals(g.getTop()));
    }


}
