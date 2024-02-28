$(document).ready(function() {
    $('.jumbotron').on('mouseenter', function() {
        $('.slide-down').stop().slideDown(200);
    });

    $('.jumbotron').on('mouseleave', function() {
        $('.slide-down').stop().slideUp(200);
    });
});

document.getElementById('image-input').addEventListener('change', handleImageLoad);
document.getElementById('remove-image').addEventListener('click', handleImageRemove);

function handleImageLoad(event) {
    if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.onload = function () {
            var preview = document.getElementById('image-preview');
            var removeButton = document.getElementById('remove-image');
            var diagnoseButton = document.getElementById('diagnose-button');
            preview.src = reader.result;
            preview.style.display = 'block';
            removeButton.style.display = 'block';
            diagnoseButton.classList.add('d-flex');
        };
        reader.readAsDataURL(event.target.files[0]);
    }
}

function handleImageRemove() {
    var preview = document.getElementById('image-preview');
    var fileInput = document.getElementById('image-input');
    var removeButton = document.getElementById('remove-image');
    var diagnoseButton = document.getElementById('diagnose-button');
    preview.src = '';
    preview.style.display = 'none';
    removeButton.style.display = 'none';
    diagnoseButton.classList.remove('d-flex');
    fileInput.value = '';
}

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    var formData = new FormData(this); 
    for (var pair of formData.entries()) {
        if (pair[1] instanceof File) {
            var file = pair[1];
        }
    }
    uploadImage(formData);
});


function uploadImage(formData) {
    const diagnoseButton = document.getElementById('diagnose-button');
    const originalButtonText = diagnoseButton.innerHTML;
    diagnoseButton.innerHTML = '<div class="loader"></div>';
    diagnoseButton.disabled = true;
    setTimeout(() => {
        fetch('api/media/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': CSRFToken
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })    
        .then(data => {
            handleResponse(data);
        })
        .catch(error => {
            handleError(error);
        })
        .finally(() => {
            diagnoseButton.innerHTML = originalButtonText;
            diagnoseButton.disabled = false;
        });
    }, 2000);

}

function handleResponse(data) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    const reportResultsTitle = document.createElement('h2');
    reportResultsTitle.className = 'report-results-title';
    reportResultsTitle.textContent = 'Diagnosis Results:';
    resultsContainer.appendChild(reportResultsTitle);
    let maxProb = 0;
    let maxClass = '';
    Object.entries(data.predictions).forEach(([label, probability]) => {
        if (probability > maxProb) {
            maxProb = probability;
            maxClass = label;
        }
    });
    const highestProbDiv = document.createElement('div');
    highestProbDiv.className = 'highest-prob';
    highestProbDiv.innerHTML = `<h4>The analysis suggests a ${(maxProb * 100).toFixed(2)}% probability that you have '${maxClass}'</h4>`;
    resultsContainer.appendChild(highestProbDiv);
    const DescDiv = document.createElement('div');
    DescDiv.className = 'highest-prob-desc';
    DescDiv.textContent = data['top_pred_description'];
    resultsContainer.appendChild(DescDiv);
    const table = document.createElement('table');
    table.className = 'results-table table-bordered table-striped';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const labelHeader = document.createElement('th');
    labelHeader.textContent = 'Skin Disease';
    const probHeader = document.createElement('th');
    probHeader.textContent = 'Confidence Level (%)';
    headerRow.appendChild(labelHeader);
    headerRow.appendChild(probHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    Object.entries(data.predictions).forEach(([label, probability]) => {
        const probabilityPercentage = (probability * 100).toFixed(15);
        if (parseFloat(probabilityPercentage) > 0.01) {
            const row = document.createElement('tr');
            const labelCell = document.createElement('td');
            labelCell.textContent = label;
            const probCell = document.createElement('td');
            probCell.textContent = probabilityPercentage + '%';
            row.appendChild(labelCell);
            row.appendChild(probCell);
            tbody.appendChild(row);
        }
    });
    table.appendChild(tbody);
    resultsContainer.appendChild(table);
}


function handleError(error) {
    console.error('Error:', error);
}

