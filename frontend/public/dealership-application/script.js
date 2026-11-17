document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const form = document.getElementById('dealership-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicators = document.querySelectorAll('.step');
    const successModal = document.getElementById('success-modal');

    // Navigation
    nextBtn.addEventListener('click', () => {
        if (validateStep1()) {
            step1.classList.remove('active');
            step2.classList.add('active');
            progressBar.style.width = '100%';
            stepIndicators[1].classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    backBtn.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
        progressBar.style.width = '0%';
        stepIndicators[1].classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // State -> District dropdown
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');

    function populateDistricts(state) {
        districtSelect.innerHTML = '<option value="" disabled selected></option>';
        (DISTRICTS[state] || []).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            districtSelect.appendChild(opt);
        });
    }

    stateSelect.addEventListener('change', () => {
        populateDistricts(stateSelect.value);
        showError(districtSelect, false);
    });
    populateDistricts(stateSelect.value);

    // Validation Rules
    function showError(inputElement, show) {
        const group = inputElement.closest('.input-group') || inputElement.closest('.form-section');
        if(group) {
            if(show) group.classList.add('error');
            else group.classList.remove('error');
        }
    }

    function validateStep1() {
        let isValid = true;
        
        // Application For Checkboxes
        const checkboxes = document.querySelectorAll('input[name="applicationFor"]:checked');
        const checkboxGroup = document.getElementById('applicationFor-error').parentElement;
        if (checkboxes.length === 0) {
            checkboxGroup.classList.add('error');
            isValid = false;
        } else {
            checkboxGroup.classList.remove('error');
        }

        // Required Inputs validation
        const inputs = step1.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            if (input.type === 'checkbox') return; // Handled above
            
            let isInputValid = input.checkValidity();
            
            // Custom validations
            if (input.id === 'gst' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(input.value)) {
                isInputValid = false;
            }
            if (input.id === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(input.value)) {
                isInputValid = false;
            }
            
            showError(input, !isInputValid);
            if (!isInputValid) isValid = false;
        });

        return isValid;
    }

    // Input listeners to clear errors on typing
    const allInputs = step1.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            if(input.type === 'checkbox') {
                document.getElementById('applicationFor-error').parentElement.classList.remove('error');
            } else {
                showError(input, false);
            }
        });
    });

    // File Upload Handling
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const fileInputs = document.querySelectorAll('.file-input');

    fileInputs.forEach(input => {
        const dropzone = input.closest('.dropzone');
        const previewContainer = dropzone.querySelector('.preview-container');
        const uploadGroup = dropzone.closest('.upload-group');

        // Drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
        });

        dropzone.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            input.files = files;
            handleFiles(files[0], input, previewContainer, uploadGroup);
        });

        input.addEventListener('change', function() {
            handleFiles(this.files[0], this, previewContainer, uploadGroup);
        });
    });

    function handleFiles(file, input, previewContainer, uploadGroup) {
        uploadGroup.classList.remove('error');
        
        if (!file) {
            previewContainer.classList.remove('active');
            previewContainer.innerHTML = '';
            return;
        }

        if (file.size > maxFileSize) {
            alert(`File size exceeds 5MB limit: ${file.name}`);
            input.value = '';
            previewContainer.classList.remove('active');
            return;
        }

        // Only images for showroom
        if (input.id === 'file-showroom' && !file.type.startsWith('image/')) {
            alert('Only image files are allowed for showroom photo.');
            input.value = '';
            return;
        }

        previewContainer.classList.add('active');
        previewContainer.innerHTML = ''; // clear

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function() {
                const img = document.createElement('img');
                img.src = reader.result;
                const p = document.createElement('p');
                p.className = 'file-name-preview';
                p.textContent = file.name;
                previewContainer.appendChild(img);
                previewContainer.appendChild(p);
            }
        } else {
            const p = document.createElement('p');
            p.className = 'file-name-preview';
            p.innerHTML = `📄<br>${file.name}`;
            previewContainer.appendChild(p);
        }
    }

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isUploadValid = true;
        const requiredFiles = ['file-pan', 'file-aadhaar-front', 'file-aadhaar-back', 'file-gst', 'file-showroom'];
        
        requiredFiles.forEach(id => {
            const fileInput = document.getElementById(id);
            const uploadGroup = fileInput.closest('.upload-group');
            if (fileInput.files.length === 0) {
                uploadGroup.classList.add('error');
                isUploadValid = false;
            }
        });

        if (isUploadValid) {
            // Log form data
            const formData = new FormData(form);
            const dataObj = {};
            
            formData.forEach((value, key) => {
                // handle multiple checkboxes
                if (key === 'applicationFor') {
                    if (!dataObj[key]) dataObj[key] = [];
                    dataObj[key].push(value);
                } else if(value instanceof File) {
                    dataObj[key] = value.name;
                } else {
                    dataObj[key] = value;
                }
            });
            
            console.log("Form Submitted Successfully!", dataObj);
            
            // Show Modal
            successModal.classList.add('active');
        }
    });
});
