import { asyncHandler } from "../utils/asyncHandler.js";
import { answerEmissionQuestion } from "../services/assistantService.js";

export const askAssistant = asyncHandler(async (req, res) => {
  const response = await answerEmissionQuestion({ organizationId: req.organizationId, question: req.body.question });
  res.json(response);
});
