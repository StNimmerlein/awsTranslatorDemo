package de.marco_sieben

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler


class App: RequestHandler<HandlerInput, HandlerOutput> {

    val translator: TextTranslator = AwsLanguageTranslator()
    val speaker: TextReader = PollyReader()

    override fun handleRequest(input: HandlerInput?, context: Context?): HandlerOutput {
        input?.let {
            val translatedMessage = translator.translate(input.text, input.targetLanguageCode)
            val audioUrl = speaker.convertToAudio(translatedMessage, input.targetLanguageCode)
            return HandlerOutput(input.text, translatedMessage, audioUrl.toURI().toASCIIString())
        }
        return HandlerOutput("", "", "")
    }

}