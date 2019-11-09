package de.marco_sieben

import java.net.URL

interface TextReader {
    fun convertToAudio(text: String, language: String): URL
}