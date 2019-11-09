package de.marco_sieben

interface TextTranslator {
    fun translate(text: String, targetLanguage: String): String
}