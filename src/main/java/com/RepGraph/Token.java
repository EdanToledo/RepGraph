/**
 * The Token class is used to represent a Token (usually a word or a meaningful part of a word). Sentences are split into a sequence of tokens.
 *
 * @since 29/08/2020
 */
package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.HashMap;

@JsonIgnoreProperties(value = {"Anchors"})
public class Token {

    /**
     * The Token's position in a sentence.
     */
    private int index;

    /**
     * The Token's standard form.
     */
    private String form;

    /**
     * The Token's canonical form, dictionary form or citation form.
     */
    private String lemma;

    /**
     * Normalized form of names or named entities.
     */
    private String carg;

    private HashMap<String,String> extraInformation = new HashMap<>();
    /**
     * Default constructor of the Token class.
     */
    public Token() {
    }

    /**
     * Fully parameterised constructor of the Token class.
     * @param index The Token's index.
     * @param form The Token's form.
     * @param lemma The Token's lemma.
     * @param carg The Token's carg.
     */
    public Token(int index, String form, String lemma, String carg) {
        this.index = index;
        this.form = form;
        this.lemma = lemma;
        this.carg = carg;
    }

    public HashMap<String, String> getExtraInformation() {
        return extraInformation;
    }

    public void setExtraInformation(HashMap<String, String> extraInformation) {
        this.extraInformation = extraInformation;
    }

    /**
     * Getter method for the Token's index.
     * @return Integer The Token's index.
     */
    public int getIndex() {
        return index;
    }

    /**
     * Setter method for the Token's index.
     * @param index The Token's index.
     */
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * Getter method for the Token's form.
     * @return String The Token's form.
     */
    public String getForm() {
        return form;
    }

    /**
     * Setter method for the Token's form.
     * @param form The Token's form.
     */
    public void setForm(String form) {
        this.form = form;
    }

    /**
     * Getter method for the Token's lemma.
     * @return String The Token's lemma.
     */
    public String getLemma() {
        return lemma;
    }

    /**
     * Setter method for the Token's lemma.
     * @param lemma The Token's lemma.
     */
    public void setLemma(String lemma) {
        this.lemma = lemma;
    }

    /**
     * Getter method for the Token's carg.
     * @return String The Token's carg.
     */
    public String getCarg() {
        return carg;
    }

    /**
     * Setter method for the Token's carg.
     * @param carg The Token's carg.
     */
    public void setCarg(String carg) {
        this.carg = carg;
    }

    /**
     * Equals method for the Token class.
     * @param o Object
     * @return boolean Whether to two classes being compared are equal.
     */
    @Override
    public boolean equals(Object o) {

        if (o == this) {
            return true;
        }

        if (!(o instanceof Token)) {
            return false;
        }

        Token t = (Token) o;

        return ((index == t.getIndex()) && (form.equals(t.getForm())) && (lemma.equals(t.getLemma())) && (carg.equals(t.getCarg())));
    }
}
