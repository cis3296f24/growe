import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function generatePlantInfo() {

    try {
        console.log('Generating plant information...');
        const openai = new OpenAI({
            apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        });
    
        const PlantChoice = z.object({
            common: z.string(),
            scientific: z.string(),
            family: z.string(),
            genus: z.string(),
            species: z.string(),
            habitat: z.string(),
            region: z.string(),
            uses: z.array(z.string()),
            description: z.string(),
            habit: z.string(),
            flowering: z.string(),
            edible: z.boolean(),
            toxicity: z.string(),
        });
        
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Return details about a plant, either real or fictional, in the following JSON format:
                {
                "common": "<Common name of the plant>",
                "scientific": "<Scientific name of the plant>",
                "family": "<Family the plant belongs to>",
                "genus": "<Genus of the plant>",
                "species": "<Species of the plant>",
                "habitat": "<Typical habitat of the plant>",
                "region": "<Geographical region where the plant is found>",
                "uses": "<Uses of the plant>",
                "description": "<Brief description of the plant>",
                "habit": "<Growth habit (e.g., tree, shrub, herb)>",
                "flowering": "<Flowering time>",
                "edible": "<Whether the plant is edible (true/false)>",
                "toxicity": "<Toxicity information>"
                }
                Ensure all fields are filled, even if it's fictional information.`,
                },
            ],
            model: "gpt-4o",
            n: 4,
            response_format: zodResponseFormat(PlantChoice, "plant"),
            temperature: 1.0,
        });

        const plants = chatCompletion.choices.map((choice) => JSON.parse(choice.message.content));
    
        return plants;
    } catch (error) {
        console.error('Error in generating plant information:', error);
        throw error;
    }
}