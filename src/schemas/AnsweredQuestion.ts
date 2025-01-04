import { Schema, model, Document } from "mongoose";

export interface IAnswer {
    value: string;
    count: number;
}

interface IAnsweredQuestion extends Document {
    question: string;
    answers: IAnswer[];
}

const AnsweredQuestionSchema = new Schema<IAnsweredQuestion>({
    question: { type: String, required: true },
    answers: [
        {
            value: { type: String, required: true },
            count: { type: Number, default: 1 },
        },
    ],
});

const AnsweredQuestion = model<IAnsweredQuestion>("AnsweredQuestion", AnsweredQuestionSchema);
export default AnsweredQuestion;
