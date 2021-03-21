package com.RepGraph;

import org.apache.commons.math3.util.Precision;

import java.io.IOException;
import java.util.*;

/**
 * The RepGraphModel class is used to store all the system's graphs and run analysis functions on graphs.
 */
public class AMRModel extends AbstractModel {


    public AMRModel() {
        super();
    }

    public AMRGraph getGraph(String graphID) throws IOException, InterruptedException {
        AMRGraph g =  (AMRGraph)graphs.get(graphID);
        g.alignNodes();
        return g;
    }

    public void alignAllGraphs() throws IOException, InterruptedException {
        for (AbstractGraph t:graphs.values()) {
            AMRGraph g =  (AMRGraph)t;
            g.alignNodes();

        }
    }

    @Override
    public HashMap<String, String> modelAnalysis() throws IOException, InterruptedException {
        HashMap<String, String> AnalysisInfo = new HashMap<>();

        float total_nodes = 0;
        float total_edges = 0;
        float total_tokens = 0;
        float total_directed_cyclic = 0;
        float total_undirected_cyclic = 0;
        float total_not_connected = 0;

        for (AbstractGraph g : graphs.values()) {

            if (g.isCyclic(true)) {
                total_directed_cyclic++;
            }
            if (g.isCyclic(false)) {
                total_undirected_cyclic++;
            }

            if (!g.connectedBFS(g.getNodes().values().iterator().next().getId())) {
                total_not_connected++;
            }
            total_nodes += g.getNodes().values().size();
            total_edges += g.getEdges().size();
            total_tokens += g.getTokens().size();

        }

        AnalysisInfo.put("Total Number of Graphs", graphs.values().size() + "");
        AnalysisInfo.put("Total Number of Nodes", Math.round(total_nodes) + "");
        AnalysisInfo.put("Total Number of Edges", Math.round(total_edges) + "");
        AnalysisInfo.put("Total Number of Tokens", Math.round(total_tokens) + "");
        AnalysisInfo.put("Average Number of Nodes", Precision.round(total_nodes / graphs.values().size(), 2) + "");
        AnalysisInfo.put("Average Number of Edges", Precision.round(total_edges / graphs.values().size(), 2) + "");
        AnalysisInfo.put("Average Number of Tokens", Precision.round(total_tokens / graphs.values().size(), 2) + "");
        AnalysisInfo.put("Percentage of Directed Cyclic Graphs", Precision.round((total_directed_cyclic / graphs.values().size()) * 100, 2) + "");
        AnalysisInfo.put("Percentage of Undirected Cyclic Graphs", Precision.round((total_undirected_cyclic / graphs.values().size()) * 100, 2) + "");
        AnalysisInfo.put("Percentage of Disconnected Graphs", Precision.round((total_not_connected / graphs.values().size()) * 100, 2) + "");
        return AnalysisInfo;
    }


}
