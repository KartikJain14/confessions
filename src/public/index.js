document.addEventListener('DOMContentLoaded', () => {
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
        if (hasVoted) {
            alert("You've already voted on this confession.");
            return;
        }

        // Store the vote in local storage
        localStorage.setItem('voted-' + confessionId, 'true');

        // Make the POST request to the server
        fetch(`/confess/vote/${confessionId}/${voteValue}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                // Update the score in the UI
                const scoreElement = document.getElementById(`score-${confessionId}`);
                const currentScore = parseInt(scoreElement.innerText, 10);
                scoreElement.innerText = currentScore + voteValue;

                // Disable the buttons
                disableButtons(confessionId);
            } else {
                alert('Error voting. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function disableButtons(confessionId) {
        const buttons = document.querySelectorAll(`#confession-${confessionId} .voting-buttons button`);
        buttons.forEach(button => button.disabled = true);
    }

    // Check if the user has already voted on each confession when the page loads
    const confessionBlocks = document.querySelectorAll('.confession-block');
    confessionBlocks.forEach(block => {
        const confessionId = block.id.split('-')[1];
        const hasVoted = localStorage.getItem('voted-' + confessionId);
        if (hasVoted) {
            disableButtons(confessionId);
        }
    });
});
