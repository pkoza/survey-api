import express from "express";
import AnsweredQuestion, {IAnswer} from "../schemas/AnsweredQuestion";
import {QUESTIONS} from "../enums/enums";

const router = express.Router();

interface AggregatedAnswers {
    values: Array<string>,
    counts: Array<number>
}
router.post("/survey", async (req, res) => {
    try {
        console.log("Received post survey", req)
        const surveyData = req.body as Record<string, string[]>;

        for (const [question, answers] of Object.entries(surveyData)) {
            if (!QUESTIONS.includes(question)){
                res.status(400).json({message: `Unknown question: ${question}`});
                return;
            }

            let questionDoc = await AnsweredQuestion.findOne({ question });

            if (!questionDoc) {
                questionDoc = new AnsweredQuestion({ question, answers: [] });
            }

            for (const answer of answers) {
                const existingAnswer = questionDoc.answers.find(
                    (a) => a.value === answer
                );

                if (existingAnswer) {
                    existingAnswer.count += 1;
                } else {
                    questionDoc.answers.push({ value: answer, count: 1 });
                }
            }

            await questionDoc.save();
        }

        res.status(200).json({ message: "Survey submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing the survey" });
    }
});

// GET /results - Fetch the top 5 answers for each question
router.get("/results", async (req, res) => {
    try {
        const results = await AnsweredQuestion.find({ question: { $ne: 'name' } });

        const formattedResults = results.reduce((acc, curr) => {
            const topAnswers = curr.answers
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            const topAnswersAggregated = topAnswers.reduce((answerAcc, answerCurr: IAnswer) => {
                answerAcc.values.push(answerCurr.value);
                answerAcc.counts.push(answerCurr.count);
                return answerAcc;
            }, {values:[], counts:[]} as AggregatedAnswers)

            acc[curr.question] = topAnswersAggregated;
            return acc;
        }, {} as Record<string, AggregatedAnswers>);
        res.status(200).json(formattedResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching results" });
    }
});

export default router;
