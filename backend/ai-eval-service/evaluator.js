import "dotenv/config";
import { readFileSync } from "fs";

export const codeEvaluator = async (language, question, answer) => {
  const rubric = readFileSync("rubric.txt", { encoding: "utf-8" });

  const res = await fetch(process.env.OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `${rubric}`,
        },
        {
          role: "user",
          content: `[QUESTION]\nWrite a ${language} ${question}\n\n[USER CODE]\n${answer}`,
        },
      ],
    }),
  });

  try {
    const data = await res.json();
    const text = data.choices[0].message.content;
    const match = text.match(/FINAL_SCORE:\s*([\d.]+)/);
    const score = match ? parseFloat(match[1]) : null;

    return score;
  } catch (err) {
    console.log(res.statusText);
    return -1;
  }
};