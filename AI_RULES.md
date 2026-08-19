# AI Rules

These rules apply to every AI agent, coding assistant, research agent, and automation
working inside this repository.

The agent must read and follow this file before making changes.

---

## 1. Understand Before Editing

1. Read `AI_RULES.md` before starting work.

2. Read the relevant:
   - source files
   - documentation
   - TASKS/*.md
   - architecture files
   - API documentation
   before modifying them.

3. Never modify code based only on assumptions about how the project works.

4. Inspect existing implementations before creating replacements.

---

## 2. Project Scope

5. This project is an end-to-end:

   Frontend
   ↓
   Backend API
   ↓
   Database
   ↓
   ML Service
   ↓
   Prediction
   ↓
   Recommendation / Optimization
   ↓
   Frontend Dashboard

6. Architecture must serve the crop-yield prediction problem.

7. Do not introduce technologies, services, or architectural patterns merely because
   they are popular or impressive.

8. Prefer the simplest architecture that correctly solves the problem.

9. Do not turn the project into unnecessary enterprise infrastructure.

10. MVP first.

---

## 3. Repository Discipline

11. Do not modify unrelated files.

12. Do not rewrite working sections of the project without a clear reason.

13. Do not delete existing functionality unless:
    - it is broken,
    - it is obsolete,
    - it is being replaced,
    - or it is explicitly requested.

14. Keep the repository clean.

15. Do not create folders simply because they are conventional.

16. Create files and directories only when they have a real purpose.

17. Do not leave temporary scripts, debug files, generated junk, or unused assets
    in the repository.

---

## 4. Tasks

18. Read the relevant `TASKS/*.md` file before starting a task.

19. Work only on the requested task unless another change is required to complete it.

20. If a task affects multiple layers, identify those layers before making changes.

21. Do not silently expand the scope of a task.

22. If a requested feature is too complex for the current stage, simplify the
    implementation rather than overbuilding.

---

## 5. Frontend Rules

23. Frontend should remain clean, lightweight, responsive, and professional.

24. The UI should resemble a serious government / enterprise application.

25. Prefer:
    - clear hierarchy
    - readable typography
    - restrained colors
    - strong spacing
    - accessible forms
    - obvious navigation

26. Avoid unnecessary:
    - animations
    - flashy effects
    - excessive gradients
    - glassmorphism
    - decorative 3D effects
    - visual clutter

27. Do not use hardcoded fake production data.

28. Mock data is acceptable during development only when clearly identified.

29. Every asynchronous UI flow should account for:
    - loading
    - success
    - error
    - empty state

30. Frontend must not contain:
    - database credentials
    - secret keys
    - ML model logic
    - server-side authorization logic

---

## 6. Backend Rules

31. Backend must validate all incoming data.

32. Never trust frontend validation alone.

33. APIs must have predictable:
    - request structures
    - response structures
    - error structures

34. Do not silently break existing API contracts.

35. Before changing an API, check all known consumers.

36. Authentication and authorization must be handled server-side.

37. Never store passwords or secrets in plaintext.

38. Never hardcode:
    - API keys
    - database credentials
    - JWT secrets
    - private keys
    - passwords

39. Use environment variables for secrets.

40. Never commit `.env` files containing real credentials.

---

## 7. Database Rules

41. Database schema must represent the actual application domain.

42. Avoid duplicate storage of the same information unless there is a documented reason.

43. Keep relationships clear and consistent.

44. Do not change database schemas casually.

45. Before changing a schema, inspect how existing code uses it.

46. Never delete existing data or migrations without explicit justification.

---

## 8. ML Rules

47. The ML system is a real component of the product, not a decorative feature.

48. Never fabricate:
    - datasets
    - predictions
    - metrics
    - accuracy
    - RMSE
    - MAE
    - R²
    - model comparisons
    - feature importance
    - confidence scores

49. If a result has not been measured, say so.

50. The ML pipeline should follow:

    Dataset
    ↓
    EDA
    ↓
    Cleaning
    ↓
    Preprocessing
    ↓
    Feature Engineering
    ↓
    Train/Test Split
    ↓
    Model Training
    ↓
    Evaluation
    ↓
    Model Selection
    ↓
    Model Saving
    ↓
    Inference

51. Do not claim that a model is "best" unless actual evaluation supports that claim.

52. Do not select a model merely because it is more advanced.

53. Model selection should consider actual evaluation metrics and practical tradeoffs.

54. Never leak test-set information into training or preprocessing.

55. Preprocessing used during inference must match preprocessing used during training.

56. Do not retrain the model on every prediction request.

57. The saved model and required preprocessing must be reproducible.

---

## 9. Agricultural Data Rules

58. Numerical agricultural inputs must have clearly defined units.

59. Do not silently mix units such as:
    - kg/ha
    - kg/acre
    - tons/ha
    - tons/acre

60. Feature names must remain consistent across:
    - frontend
    - backend
    - database
    - ML model

61. Do not invent scientific ranges.

62. Do not invent agricultural recommendations.

63. Recommendations must come from:
    - the trained model,
    - documented rules,
    - verified domain knowledge,
    - or a clearly documented combination of these.

64. Clearly distinguish assumptions from verified facts.

---

## 10. Prediction Rules

65. A prediction is an estimate produced by a model.

66. Never present model output as guaranteed real-world results.

67. Do not use misleading language such as:
    - guaranteed yield
    - guaranteed improvement
    - certain result
    - exact future yield

68. Prefer:
    - predicted
    - estimated
    - model-based estimate
    - scenario estimate

69. Every important prediction should be traceable to:

    Input
    ↓
    Validation
    ↓
    Preprocessing
    ↓
    Model
    ↓
    Output

---

## 11. What-If Simulator

70. The What-If Simulator must use the actual trained model.

71. It must calculate:

    Current inputs
    ↓
    Current prediction

    Modified inputs
    ↓
    Scenario prediction

    Scenario prediction - Current prediction
    ↓
    Improvement

72. Never hardcode fake improvements.

73. Never display a percentage improvement unless it was mathematically calculated
    from actual predictions.

74. The simulator represents a model-based scenario, not a guaranteed real-world
    outcome.

75. Do not allow impossible or undocumented input values.

---

## 12. Recommendation / Optimization

76. Do not call simple hardcoded rules "AI optimization."

77. If optimization is implemented, clearly document:
    - objective
    - variables
    - constraints
    - search/optimization method
    - interpretation of results

78. Optimization must respect defined constraints.

79. Do not recommend physically unrealistic values merely because they produce
    higher model predictions.

80. A model finding a better numerical result does not automatically mean it is
    agronomically advisable.

---

## 13. Data Integrity

81. Never fabricate historical records to make dashboards look complete.

82. Never generate fake analytics for demonstrations unless explicitly marked as demo data.

83. Empty datasets should produce proper empty states.

84. Important numbers displayed in the UI must have a traceable source.

85. Charts must represent actual available data.

86. Do not create misleading charts or metrics.

---

## 14. Research Rules

87. When external research is required, prefer:
    - official documentation
    - government sources
    - academic papers
    - primary datasets
    - reputable technical sources

88. Do not treat random blogs or AI-generated articles as authoritative sources.

89. When using external information for important technical or agricultural decisions,
    record the source.

90. Do not invent citations or sources.

91. Verify information that may have changed over time when necessary.

---

## 15. Security

92. Never expose:
    - passwords
    - tokens
    - API keys
    - database credentials
    - private keys

93. Never commit secrets.

94. Do not weaken authentication or authorization simply to make development easier.

95. Server-side authorization is mandatory for protected resources.

96. Do not expose stack traces or sensitive internal details to end users.

97. Validate user input on the server.

---

## 16. Testing

98. Test before declaring a feature complete.

99. Test the complete flow where applicable:

    Frontend
    ↓
    API
    ↓
    Backend
    ↓
    Database / ML
    ↓
    Response
    ↓
    Frontend

100. Do not claim that something is tested unless it was actually tested.

101. Do not claim that something is fixed unless the fix was verified.

102. Test both:
     - normal cases
     - failure / edge cases

103. If tests cannot be run, explicitly state that they were not run.

---

## 17. Debugging

104. When something breaks:

     1. Reproduce it.
     2. Read the error.
     3. Identify the responsible layer.
     4. Find the root cause.
     5. Make the smallest appropriate fix.
     6. Test the fix.

105. Do not randomly change unrelated code.

106. Do not hide errors by:
     - deleting logs
     - disabling validation
     - swallowing exceptions
     - commenting out broken functionality

107. Fix root causes rather than symptoms where practical.

---

## 18. Dependencies

108. Do not add a dependency without a reason.

109. Before adding a package, determine whether the existing stack can solve the problem.

110. Avoid unnecessary dependencies.

111. Do not upgrade major dependencies without checking compatibility.

112. Do not introduce a framework solely because an AI suggested it.

---

## 19. Documentation

113. Documentation must describe the actual implementation.

114. Never document features that do not exist.

115. Important architecture decisions must be recorded in:

     `DECISIONS.md`

116. Major execution or data-flow changes should be reflected in:

     `FLOW.md`

117. API changes should be reflected in the relevant API documentation.

118. ML changes should be reflected in ML documentation.

119. README must always remain truthful.

---

## 20. AI-Generated Code

120. AI-generated code must be understood before being accepted.

121. Do not blindly copy generated code.

122. Do not accept code merely because:
     - it compiles
     - it looks professional
     - the AI says it is correct

123. Generated code must fit the project's existing architecture.

124. AI must not modify unrelated areas.

125. AI must not silently introduce new architecture.

126. AI must explain significant technical decisions when requested.

---

## 21. Change Discipline

127. Prefer small, focused changes.

128. Do not rewrite the project from scratch unless explicitly instructed.

129. Do not refactor unrelated code while implementing a feature.

130. Do not modify multiple architectural layers unnecessarily.

131. If a change must affect multiple areas, identify those dependencies first.

132. Preserve working functionality whenever possible.

---

## 22. Git Rules

133. Never push directly to `main`.

134. Use feature branches.

135. Fetch/pull the latest relevant changes before starting work where applicable.

136. Test before pushing.

137. Use Pull Requests for meaningful changes.

138. Do not merge knowingly broken code.

139. Commit messages should describe actual changes.

Example:

    feat: add crop prediction endpoint
    feat: add what-if simulator
    fix: validate rainfall input
    refactor: separate ML inference service
    docs: update architecture

140. Avoid meaningless commits such as:

    stuff
    changes
    final
    final2
    latest

---

## 23. MVP Rules

141. Build the MVP before advanced features.

142. Core functionality has priority over polish.

143. The project should first achieve:

    User Input
    ↓
    Backend
    ↓
    ML Prediction
    ↓
    Database
    ↓
    Dashboard

144. Then build:

    Prediction History
    ↓
    What-If Simulator
    ↓
    Recommendations
    ↓
    Analytics

145. Do not sacrifice core ML functionality for visual polish.

146. If a feature becomes too expensive or risky for the remaining development time,
     simplify it.

---

## 24. No Fake Intelligence

147. Do not add AI terminology merely for presentation.

148. If something is rule-based, call it rule-based.

149. If something is a statistical model, call it a statistical model.

150. If something is machine learning, identify the actual model.

151. Do not label:
     - simple arithmetic as AI
     - hardcoded conditions as machine learning
     - static recommendations as optimization
     - random generated values as predictions

---

## 25. Honesty Rule

152. Never claim work was completed when it was not.

153. Never claim tests were run when they were not.

154. Never claim a model was trained when it was not.

155. Never claim a model was evaluated when it was not.

156. Never claim an API works when it was not tested.

157. Never claim external information was verified when it was not.

158. When uncertain, say:

     "I don't know yet."

     "This has not been verified."

     "This is an assumption."

     "This still needs to be tested."

---

## 26. Decision-Making

159. When multiple solutions are possible, prefer the one that is:

     1. Correct
     2. Simple
     3. Maintainable
     4. Testable
     5. Explainable
     6. Appropriate for the project scope

160. Do not choose technology because it sounds impressive.

161. Architecture must follow the problem and solution, not the other way around.

---

## 27. Before Every Major Change

The agent should mentally verify:

- What am I changing?
- Why am I changing it?
- Which layer owns this responsibility?
- What existing code depends on it?
- Could this break something?
- How will I test it?
- Does the change actually help the MVP?

---

## 28. Final Rule

When forced to choose between:

- impressive vs correct → choose correct
- complex vs simple → choose simple
- fast vs reliable → choose reliable
- fake result vs incomplete result → choose incomplete result
- assumption vs verification → choose verification
- feature count vs working core → choose working core

The goal is not to make the project look intelligent.

The goal is to build a technically credible, explainable, reliable
AI-powered crop yield prediction system.