document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Modal Logic ---
    const modalOverlay = document.getElementById('customModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseButton = document.getElementById('modalCloseButton');

    function showModal(message) {
        if (modalOverlay && modalMessage) {
            modalMessage.textContent = message;
            modalOverlay.classList.add('visible');
        }
    }

    function hideModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
        }
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', hideModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                hideModal();
            }
        });
    }

    // --- Voting Logic ---
    const voteButtons = document.querySelectorAll('.vote-button');
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const confessionId = button.getAttribute('data-id');
            const voteValue = parseInt(button.getAttribute('data-value'));
            handleVote(confessionId, voteValue);
        });
    });

    function handleVote(confessionId, voteValue) {
        const hasVoted = localStorage.getItem('voted-' + confessionId);
        // FIX: Show the modal if the user has already voted.
        if (hasVoted) {
            showModal("You've already voted on this confession.");
            return;
        }

        localStorage.setItem('voted-' + confessionId, 'true');

        fetch(`/confess/vote/${confessionId}/${voteValue}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                const scoreElement = document.getElementById(`score-${confessionId}`);
                const currentScore = parseInt(scoreElement.innerText, 10);
                scoreElement.innerText = currentScore + voteValue;
                disableButtons(confessionId);
            } else {
                showModal('Error voting. Please try again later.');
                localStorage.removeItem('voted-' + confessionId);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showModal('A network error occurred. Please try again.');
            localStorage.removeItem('voted-' + confessionId);
        });
    }

    function disableButtons(confessionId) {
        const buttons = document.querySelectorAll(`#confession-${confessionId} .voting-buttons button`);
        buttons.forEach(button => button.disabled = true);
    }

    const confessionBlocks = document.querySelectorAll('.confession-block');
    confessionBlocks.forEach(block => {
        const confessionId = block.id.split('-')[1];
        if (localStorage.getItem('voted-' + confessionId)) {
            disableButtons(confessionId);
        }
    });

    // --- Form Validation ---
    const confessionForm = document.getElementById('confessionForm');
    if (confessionForm) {
        confessionForm.addEventListener('submit', function(event) {
            const confession = document.getElementById('confession').value;
            const errorMessage = document.getElementById('error-message');
            
            if (confession.length < 10 || confession.length > 255) {
                event.preventDefault();
                if(errorMessage) {
                    errorMessage.textContent = "Confession must be between 10 and 255 characters.";
                    errorMessage.style.display = "block";
                }
            } else {
                if(errorMessage) {
                    errorMessage.style.display = "none";
                }
            }
        });
    }

    // --- Floating Text Initialization ---
    initializeFloatingText();
});

function copyLink(button){
    navigator.clipboard.writeText(window.location.href);
    button.innerText = 'Copied!';
    setTimeout(() => {
        button.innerText = 'Copy URL';
    }, 2000);
}

function initializeFloatingText() {
    const floatingMessages = [
        "In 8th class, I got to know...", "I told her that I...", "I never thought that...", "My biggest secret is...", "I once stole...",
        "Nobody knows that I...", "I'm afraid to admit...", "The truth is I...", "I secretly love...", "I wish I could tell someone...",
        "My darkest moment was...", "I pretend to be...", "Deep down, I know...", "I've been hiding...", "What haunts me is...",
        "I lied about...", "My family doesn't know...", "I cheated on...", "I still think about...", "I'm ashamed that..."
    ];

    let floatingTexts = [];
    // FIX: A Set to keep track of phrases currently on screen to prevent duplicates.
    let activeMessages = new Set();
    const mainTextarea = document.getElementById('confession');

    class FloatingText {
        constructor(message) {
            this.message = message;
            this.element = document.createElement('div');
            this.element.className = 'floating-text';
            this.element.textContent = message;
            
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            
            if (Math.abs(this.vx) < 0.3) this.vx = this.vx > 0 ? 0.3 : -0.3;
            if (Math.abs(this.vy) < 0.3) this.vy = this.vy > 0 ? 0.3 : -0.3;
            
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;

            this.element.addEventListener('click', () => {
                if (mainTextarea) {
                    mainTextarea.value = this.element.textContent;
                    mainTextarea.focus();
                }
            });
            
            document.body.appendChild(this.element);
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            const rect = this.element.getBoundingClientRect();
            if (this.x <= 0 || this.x >= window.innerWidth - rect.width) {
                this.vx *= -1;
            }
            if (this.y <= 0 || this.y >= window.innerHeight - rect.height) {
                this.vy *= -1;
            }

            this.element.style.transform = `translate(${this.x - rect.width/2}px, ${this.y - rect.height/2}px)`;
        }

        destroy() {
            // FIX: Remove the message from the active set when the element is destroyed.
            activeMessages.delete(this.message);
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    }

    function animate() {
        // FIX: Limit to 10 and ensure no duplicates are created.
        if (Math.random() < 0.02 && floatingTexts.length < 10) {
            const availableMessages = floatingMessages.filter(msg => !activeMessages.has(msg));
            if (availableMessages.length > 0) {
                const message = availableMessages[Math.floor(Math.random() * availableMessages.length)];
                activeMessages.add(message); // Add to set before creating
                floatingTexts.push(new FloatingText(message));
            }
        }

        floatingTexts.forEach((text, index) => {
            text.update();
            const rect = text.element.getBoundingClientRect();
            if (rect.right < -200 || rect.left > window.innerWidth + 200 || rect.bottom < -200 || rect.top > window.innerHeight + 200) {
                text.destroy();
                floatingTexts.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}
