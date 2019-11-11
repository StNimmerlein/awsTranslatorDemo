package de.marco_sieben

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.translate.AmazonTranslate
import com.amazonaws.services.translate.AmazonTranslateClient
import com.amazonaws.services.translate.model.TranslateTextRequest

class AwsLanguageTranslator : TextTranslator {

    private val translater: AmazonTranslate

    constructor() {
        val credentialsProvider = DefaultAWSCredentialsProviderChain.getInstance()
        translater = AmazonTranslateClient.builder()
                .withCredentials(AWSStaticCredentialsProvider(credentialsProvider.credentials))
                .withRegion(Regions.EU_CENTRAL_1)
                .build()
    }

    override fun translate(originalText: String, targetLanguage: String): String {
        val translateTextRequest = TranslateTextRequest().apply {
            sourceLanguageCode = "auto"
            targetLanguageCode = targetLanguage
            text = originalText
        }
        val translateText = translater.translateText(translateTextRequest)
        return translateText.translatedText
    }
}
