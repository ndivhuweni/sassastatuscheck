var $ = jQuery.noConflict();

$(document).ready(function() {
    let sassaResult = $('.sassa__result');
    let sassaStatusData = localStorage.getItem('sassaStatusData');

    if (sassaStatusData) {
        let content = renderResult(JSON.parse(sassaStatusData));
        setTimeout(() => {
            $('form.sassa__form').hide();
        }, 1);
        setTimeout(() => {
            sassaResult.html(content).fadeIn();
            localStorage.removeItem('sassaStatusData');
        }, 100);
    }

    $('form.sassa__form').on('submit', function(e) {
        e.preventDefault();

        let formDiv = $(this);
        
        sassaResult.hide();
        formDiv.find('.sassa__input').attr('disabled', 'disabled');
        formDiv.find('.sassa__button').attr('disabled', 'disabled').text('Checking...');

        let sss = $.ajax({
            url: `https://srd.sassa.gov.za/srdweb/api/web/outcome/${formDiv.find('#id_number').val()}/${formDiv.find('#phone_number').val()}`,
            type: 'GET',
            dataType: 'json',
            success: (response) => {
                localStorage.setItem('sassaStatusData', JSON.stringify(response));
            },
            error: (error) => {
                let message = error.responseJSON.messages;

                $('.sassa__alert').text(message).addClass('sassa__alert--error').fadeIn();
            },
            complete: () => {
                if (localStorage.getItem('sassaStatusData')) {
                    window.location.reload();
                } else {
                    formDiv.find('.sassa__input').prop('disabled', false);
                    formDiv.find('.sassa__button').prop('disabled', false).text('Check Status');
    
                    setTimeout(() => {
                        $('.sassa__alert').fadeOut();
                    }, 5000);
                }
            }
        });
    });

    function renderResult (data) {
        let __button = `<button type="button" class="sassa__button" onclick="showSassaForm();">Check Status Again</button>`;
        let __html = `
            <div style="text-align: center; margin-bottom: 20px">${__button}</div>
            <div class="sassa__card">
                <div class="sassa__card__heading">APPLICATION ${data.appId}</div>
                <div class="sassa__card__body">
                    <ul class="sassa__list">
        `; 

        (data.outcomes.reverse()).forEach(element => {
            let __text = '';

            if (element.outcome === 'approved') {
                __text = `Your application has been approved and your pay day is ${element.payday}, ${element.period}`;
            } else if (element.outcome === 'declined') {
                __text = `Your application has been declined , reason: ${element.reason} undefined.`;
            } else {
                __text = `Your application is still pending`;
            }
            
            __html += `
                <li>
                    <div class="sassa__list__heading sassa__list__heading--${element.outcome}">${element.period} ${element.outcome}</div>
                    <div class="sassa__list__description">${__text}</div>
                </li>
            `;
        });

        __html += `
                    </ul>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px">${__button}</div>
        `;

        return __html;
    }
});

function showSassaForm() {
    $('.sassa__result').hide();
    $('form.sassa__form').fadeIn().find('.sassa__input').val('')[0].focus();
}