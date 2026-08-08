import { Link } from "react-router-dom";
import { useToday } from "./context/useToday.js";
import { useUser } from "./context/UserContext.jsx";
import Hero from "./components/Hero.jsx";
import AnswerForm from "./components/AnswerForm.jsx";
import SignIn from "./components/SignIn.jsx";
import Share from "./components/Share.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import { formatLongDate, todayEastern } from "./utils/date.js";
import { rotationClass } from "./utils/colors.js";
import { Send, ArrowRight } from "lucide-react";
import "./styles/components/Hero.scss";
import NoPrompt from "./components/NoPrompt.jsx";
import Loading from "./components/Loading.jsx";

export default function App() {
  const { loginAsGuest } = useUser();
  const {
    user,
    prompt,
    emptyPrompt,
    loading,
    submitting,
    error,
    alreadySubmitted,
    mySubmittedAnswers,
    submitAnswers,
  } = useToday();

  if (loading) {
    if (error == "No prompt set for today! Go bother Brian") {
      return <NoPrompt color={"orange"} />;
    }
    return <Loading className="page">Loading...</Loading>;
  }

  return (
    <div className="page">
      <Hero
        color="orange"
        eyebrow={formatLongDate(prompt?.date)}
        emoji={prompt?.emoji}
        image={true}
      />

      {!user && <SignIn onGuestLogin={loginAsGuest} />}

      {user && !alreadySubmitted && (
        <AnswerForm
          onSubmit={submitAnswers}
          submitting={submitting}
          prompt={prompt}
        />
      )}

      {error && <p style={{ color: "#d9362e" }}>{error}</p>}

      {user && alreadySubmitted && (
        <div className="today">
          <h1 className="brand header">
            {prompt.emoji ?? ""} Mount Rushmore of {prompt.text}
          </h1>
          <div className="your-answers-card">
            <div className="your-answers-header">
              Your answers{" "}
              <Share
                prompt={prompt}
                answers={mySubmittedAnswers?.answers || []}
              />
            </div>
            <div className="your-answers-body">
              <ul className="display-pill-list">
                {(mySubmittedAnswers?.answers || []).map((a, i) => (
                  <li key={i} className={`display-pill ${rotationClass(i)}`}>
                    <span className={`answer-pill-badge ${rotationClass(i)}`}>
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="align-center">
            You've already submitted your answers for today's Mount Rushmore -
            check back tomorrow.
          </p>
          <div className="align-center">
            <Link
              to="/community"
              className="btn-link"
              style={{
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              See what others said <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <SocialLinks />
    </div>
  );
}
