import amrlib
from amrlib.alignments.rbw_aligner import RBWAligner
from amrlib.graph_processing.annotator import add_lemmas,annotate_graph
import penman
from penman.surface import Alignment
import os
import sys

if __name__ == '__main__':

    graph_string = sys.argv[1]

    penman_graph = annotate_graph(graph_string)
    tokens = eval(penman_graph.metadata["tokens"])
    ner_tags = eval(penman_graph.metadata["ner_tags"])
    ner_iob = eval(penman_graph.metadata["ner_iob"])
    pos_tags = eval(penman_graph.metadata["pos_tags"])
    lemmas = eval(penman_graph.metadata["lemmas"])

    aligner = RBWAligner.from_penman_w_json(penman_graph)
    aligned_graph = aligner.get_penman_graph()
    alignments = penman.surface._get_alignments(aligned_graph, Alignment)
    for key in alignments:
        print(key[0],alignments[key].indices)

    print("###tokens")
    for token in tokens:
        print(token,end="<###>")

    print("\n###ner_tags")
    for ner in ner_tags:
        print(ner,end="<###>")

    print("\n###ner_iob_tags")
    for ner_iob_tag in ner_iob:
        print(ner_iob_tag,end="<###>")

    print("\n###pos_tags")
    for pos in pos_tags:
        print(pos,end="<###>")

    print("\n###lemmas")
    for lemma in lemmas:
        print(lemma,end="<###>")

