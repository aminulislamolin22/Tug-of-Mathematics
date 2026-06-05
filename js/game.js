class TugOfMathGame {
    constructor() {
        this.ropePosition = 0;
        this.currentPlayer = 1;
        this.correctAnswer = 0;
        this.startTime = 0;

        this.score = { p1: 0, p2: 0 };
        this.roundsToWin = 2; // Best-of-3
        this.maxPosition = 8;
        this.combo = 0;

        this.elements = {
            rope: document.getElementById("rope"),
            question: document.getElementById("question"),
            answer: document.getElementById("answer"),
            result: document.getElementById("result"),
            turn: document.getElementById("turn"),
            combo: document.getElementById("combo"),
            warning: document.getElementById("warning"),
            p1Score: document.getElementById("p1Score"),
            p2Score: document.getElementById("p2Score"),
            correctSound: document.getElementById("correctSound"),
            wrongSound: document.getElementById("wrongSound")
        };

        document.getElementById("submitBtn")
            .addEventListener("click", () => this.submit());

        this.elements.answer.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.submit();
        });

        this.newQuestion();
    }

    newQuestion() {
        let a = Math.floor(Math.random() * 10);
        let b = Math.floor(Math.random() * 10);
        this.correctAnswer = a + b;
        this.elements.question.innerText = `${a} + ${b} = ?`;
        this.elements.answer.value = "";
        this.elements.answer.focus();
        this.startTime = Date.now();
    }

    submit() {
        if (this.elements.answer.disabled) return;

        let ans = parseInt(this.elements.answer.value);
        if (isNaN(ans)) return;

        let time = (Date.now() - this.startTime) / 1000;
        let power = time < 3 ? 3 : time < 6 ? 2 : 1;

        if (ans === this.correctAnswer) {
            this.combo++;
            power += Math.floor(this.combo / 3);
            this.applyForce(power);
            this.showFeedback("correct");
            this.showCombo();
        } else {
            this.combo = 0;
            this.showFeedback("wrong");
        }

        this.updateRope();
        this.checkAlmostThere();
        this.checkWin();
        this.switchTurn();
        this.newQuestion();
    }

    showFeedback(type) {
        switch(type) {
            case "correct":
                this.elements.result.innerText = "Olin Correct!";
                this.elements.result.style.color = "#4CAF50";
                this.flashRope("#4CAF50");
                this.play("correctSound");
                break;

            case "wrong":
                this.elements.result.innerText = "Olin Wrong!";
                this.elements.result.style.color = "#F44336";
                this.flashRope("#F44336");
                this.play("wrongSound");
                break;

            case "ai-correct":
                this.elements.result.innerText = "AI Correct!";
                this.elements.result.style.color = "#4CAF50";
                this.flashRope("#4CAF50");
                this.play("correctSound");
                break;

            case "ai-wrong":
                this.elements.result.innerText = "AI Wrong!";
                this.elements.result.style.color = "#F44336";
                this.flashRope("#F44336");
                this.play("wrongSound");
                break;
        }
    }

    clearFeedback() {
        this.elements.result.innerText = "";
        this.elements.combo.innerText = "";
        this.elements.warning.style.display = "none";
    }

    flashRope(color) {
        let rope = this.elements.rope;
        rope.style.backgroundColor = color;
        setTimeout(() => rope.style.backgroundColor = "brown", 300);
    }

    applyForce(power) {
        if (this.currentPlayer === 1) this.ropePosition -= power;
        else this.ropePosition += power;
    }

    updateRope() {
        let percent = 50 + this.ropePosition * 5;
        this.elements.rope.style.left = percent + "%";
        this.elements.rope.classList.add("shake");
        setTimeout(() => this.elements.rope.classList.remove("shake"), 300);
    }

    showCombo() {
        if (this.combo > 1)
            this.elements.combo.innerText = `🔥 Combo x${this.combo}`;
    }

    checkAlmostThere() {
        if (this.ropePosition >= this.maxPosition - 2 || this.ropePosition <= -this.maxPosition + 2) {
            this.elements.warning.style.display = "block";
        } else {
            this.elements.warning.style.display = "none";
        }
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        if (this.currentPlayer === 2) this.aiMove();
        else this.elements.turn.innerText = "Your Turn";
    }

    aiMove() {
        this.elements.turn.innerText = "AI thinking...";
        this.elements.answer.disabled = true;

        let delay = Math.random() * 2000 + 1000;
        setTimeout(() => {
            let correct = Math.random() < 0.8;
            let power = 2;

            if (correct) this.applyForce(power);
            this.showFeedback(correct ? "ai-correct" : "ai-wrong");

            this.updateRope();
            this.checkAlmostThere();
            this.checkWin();

            this.currentPlayer = 1;
            this.elements.turn.innerText = "Your Turn";
            this.elements.answer.disabled = false;
            this.newQuestion();
        }, delay);
    }

    checkWin() {
        if (this.ropePosition <= -this.maxPosition) this.endRound(1);
        else if (this.ropePosition >= this.maxPosition) this.endRound(2);
    }

    endRound(winner) {
        if (winner === 1) this.score.p1++;
        else this.score.p2++;

        this.updateScore();
        this.showWinAnimation();
        this.showLeaderboardRound();

        this.clearFeedback();

        if (this.score.p1 === this.roundsToWin || this.score.p2 === this.roundsToWin) {
            setTimeout(() => {
                let finalMessage = `🏆 Series Complete!\nOlin: ${this.score.p1}\nAI: ${this.score.p2}\n`;
                if (this.score.p1 > this.score.p2) finalMessage += "🎉 Olin won the series!";
                else finalMessage += "🤖 AI won the series!";
                alert(finalMessage);
                this.resetMatch();
            }, 400);
        } else {
            this.ropePosition = 0;
            this.updateRope();
            this.combo = 0;
        }
    }

    showLeaderboardRound() {
        let message = `🏆 Round Result\nOlin: ${this.score.p1}\nAI: ${this.score.p2}\n`;
        if (this.score.p1 > this.score.p2) message += "Olin won this round!";
        else if (this.score.p2 > this.score.p1) message += "🤖 AI won this round!";
        else message += "⚖️ Round tied!";
        alert(message);
    }

    showWinAnimation() {
        this.elements.rope.classList.add("win");
        setTimeout(() => this.elements.rope.classList.remove("win"), 600);
    }

    updateScore() {
        this.elements.p1Score.innerText = this.score.p1;
        this.elements.p2Score.innerText = this.score.p2;
    }

    resetMatch() {
        this.score = { p1: 0, p2: 0 };
        this.updateScore();
        this.ropePosition = 0;
        this.updateRope();
        this.combo = 0;
        this.clearFeedback();
    }

    play(id) {
        let s = this.elements[id];
        s.currentTime = 0;
        s.play().catch(() => {});
    }
}

new TugOfMathGame();