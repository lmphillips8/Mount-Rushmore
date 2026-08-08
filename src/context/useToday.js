import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";

export function useToday() {
  const { user } = useUser();
  const [prompt, setPrompt] = useState(null);
  const [myAnswers, setMyAnswers] = useState(null); // set once submitted this session
  const [others, setOthers] = useState(undefined); // undefined = not fetched yet
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .todayPrompt()
      .then(setPrompt)
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  useEffect(() => {
    if (user && prompt) {
      api.todayAnswers(prompt.id).then(setOthers);
    }
  }, [user, prompt]);

  const submitAnswers = async (answers) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitAnswers(prompt.id, answers);
      setMyAnswers(answers);
      const fresh = await api.todayAnswers(prompt.id);
      setOthers(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loading = user === undefined || (user && others === undefined);
  const answersData = others ?? { unlocked: false, answers: [] };
  const alreadySubmitted = answersData.unlocked;
  const mySubmittedAnswers = user
    ? answersData.answers.find((a) => a.userId === user.userId)
    : null;

  return {
    user,
    prompt,
    loading,
    submitting,
    error,
    alreadySubmitted,
    answersData,
    mySubmittedAnswers,
    myAnswers,
    submitAnswers,
  };
}
