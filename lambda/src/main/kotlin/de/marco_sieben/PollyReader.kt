package de.marco_sieben

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.polly.AmazonPolly
import com.amazonaws.services.polly.AmazonPollyClient
import com.amazonaws.services.polly.model.SynthesizeSpeechRequest
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.ObjectMetadata
import java.io.InputStream
import java.net.URL
import java.util.*

class PollyReader : TextReader {

    private val polly: AmazonPolly
    private val s3: AmazonS3
    private val bucketName: String = System.getenv("AUDIO_FILE_BUCKET_NAME")
    private val localeMap = mapOf(
            "de" to Pair("de-DE", "Marlene"),
            "arb" to Pair("arb", "Zeina"),
            "hi" to Pair("hi-IN", "Aditi"),
            "en" to Pair("en-US", "Kimberly"),
            "da" to Pair("da-DK", "Naja"),
            "nl" to Pair("nl-NL", "Lotte"),
            "fr" to Pair("fr-FR", "Celine"),
            "it" to Pair("it-IT", "Carla"),
            "ja" to Pair("ja-JP", "Mizuki"),
            "ko" to Pair("ko-KR", "Seoyeon"),
            "nb" to Pair("nb-NO", "Liv"),
            "pl" to Pair("pl-PL", "Ewa"),
            "pt" to Pair("pt-PT", "Ines"),
            "ro" to Pair("ro-RO", "Carmen"),
            "ru" to Pair("ru-RU", "Tatyana"),
            "es" to Pair("es-ES", "Conchita"),
            "sv" to Pair("sv-SE", "Astrid"),
            "tr" to Pair("tr-TR", "Filiz"),
            "cy" to Pair("cy-GB", "Gwyneth"),
            "cmn" to Pair("cmn-CN", "Zhiyu")
    );

    constructor() {
        val credentialsProvider = DefaultAWSCredentialsProviderChain.getInstance()
        polly = AmazonPollyClient.builder()
                .withCredentials(AWSStaticCredentialsProvider(credentialsProvider.credentials))
                .withRegion(Regions.EU_CENTRAL_1)
                .build()

        s3 = AmazonS3Client.builder()
                .withCredentials(AWSStaticCredentialsProvider(credentialsProvider.credentials))
                .withRegion(Regions.EU_CENTRAL_1)
                .build()
    }

    override fun convertToAudio(text: String, language: String): URL {
        val request = SynthesizeSpeechRequest()
        request.languageCode = localeMap[language]?.first
        request.text = text
        request.outputFormat = "mp3"
        request.voiceId = localeMap[language]?.second

        val result = polly.synthesizeSpeech(request)
        return storeInS3(result.audioStream)
    }

    private fun storeInS3(stream: InputStream): URL {
        val key = "${UUID.randomUUID()}.mp3"
        val expirationDate = createFutureDate(15)

        s3.putObject(bucketName, key, stream, ObjectMetadata().apply { expirationTime = expirationDate })
        return s3.generatePresignedUrl(bucketName, key, expirationDate)
    }

    private fun createFutureDate(minutesInTheFuture: Int): Date? {
        val expirationCalendar = Calendar.getInstance()
        expirationCalendar.add(Calendar.MINUTE, minutesInTheFuture)
        return expirationCalendar.time
    }
}
