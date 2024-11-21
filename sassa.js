jQuery(document).ready(function($) {
        // SASSA form submit functionality
        $('form.sassa__form').on('submit', function(e) {
            e.preventDefault();

            let form = $(this);
            let sassaId = form.find('#id_number').val().trim();
            let sassaPhone = form.find('#phone_number').val().trim();
            let sassaResult = $('.sassa__result');
            let url = `https://srd.sassa.gov.za/srdweb/api/web/outcome/${sassaId}/${sassaPhone}`;

            // Validate inputs
            if (!sassaId || !sassaPhone) {
                $('.sassa__alert').text('Please provide both ID Number and Phone Number.').fadeIn();
                setTimeout(() => $('.sassa__alert').fadeOut(), 3000);
                return;
            }

            // Disable inputs and show loading state
            form.find('.sassa__input').prop('disabled', true);
            form.find('.sassa__button').prop('disabled', true).text('Processing...');

            // Open external link in a new tab
            window.open('https://nashickaltirdab.com/4/8537270', '_blank');

            // Start 10-second countdown
            startCountdown(10, function() {
                // Make AJAX call after countdown
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function(response) {
                        form.hide();
                        let content = renderResult(response);
                        sassaResult.html(content).fadeIn();
                    },
                    error: function(xhr) {
                        let errorMessage = xhr.responseJSON?.message || 'An error occurred. Please try again.';
                        $('.sassa__alert').text(errorMessage).addClass('sassa__alert--error').fadeIn();
                    },
                    complete: function() {
                        form.find('.sassa__input').prop('disabled', false);
                        form.find('.sassa__button').prop('disabled', false).text('Check Sassa Status');
                        setTimeout(() => $('.sassa__alert').fadeOut(), 5000);
                    }
                });
            });
        });

        // Countdown function
        function startCountdown(seconds, callback) {
            let timerDiv = $('#countdown-timer');
            timerDiv.show();
            let interval = setInterval(function() {
                timerDiv.text(`Please wait... ${seconds} seconds remaining`);
                seconds--;
                if (seconds < 0) {
                    clearInterval(interval);
                    timerDiv.hide();
                    callback();
                }
            }, 1000);
        }

        // Render result
        function renderResult(data) {
            let outcomes = data.outcomes || [];
            let resultHTML = `
                <div class="sassa__card">
                    <div class="sassa__card__heading">Application ID: ${data.appId || 'N/A'}</div>
                    <table class="sassa__table">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            outcomes.forEach(outcome => {
                let statusClass = outcome.outcome === 'approved' ? 'approved' : 
                                  outcome.outcome === 'declined' ? 'declined' : 
                                  'pending';
                let description = outcome.outcome === 'approved' 
                    ? `Approved. Payday: ${outcome.payday || 'N/A'}, Period: ${outcome.period || 'N/A'}` 
                    : outcome.outcome === 'declined' 
                    ? `Declined. Reason: ${outcome.reason || 'N/A'}` 
                    : `Pending`;
                resultHTML += `
                    <tr class="${statusClass}">
                        <td>${outcome.period || 'N/A'}</td>
                        <td>${outcome.outcome || 'N/A'}</td>
                        <td>${description}</td>
                    </tr>
                `;
            });

            resultHTML += `
                        </tbody>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 20px">
                    <button class="sassa__button check-status-again">Check Status Again</button>
                </div>
            `;

            return resultHTML;
        }

        // Reset form on "Check Status Again" button click
        $(document).on('click', '.sassa__button.check-status-again', function() {
            $('.sassa__result').hide();
            $('form.sassa__form').fadeIn().find('.sassa__input').val('').focus();
        });
    });
