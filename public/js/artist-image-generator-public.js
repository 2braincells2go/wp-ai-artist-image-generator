document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".aig-form");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const publicPrompt = document.getElementById("aig_public_prompt").value;
            const topicCheckboxes = document.querySelectorAll("input[name='aig_topics[]']:checked");
            const topics = Array.from(topicCheckboxes).map(input => input.value).join(",");
            const promptInput = document.querySelector("input[name='aig_prompt']");
            const prompt = promptInput ? promptInput.value : "";
            const promptWithValues = prompt
                .replace("{public_prompt}", publicPrompt)
                .replace("{topics}", topics);

            const container = document.querySelector(".aig-form-container");
            const containerResults = document.querySelector(".aig-results");
            containerResults.innerHTML = '';

            // remove previous overlay
            const previousOverlay = document.querySelector(".aig-overlay");
            if (previousOverlay) {
                previousOverlay.remove();
            }

            const overlay = document.createElement("div");
            overlay.className = "aig-overlay";
            container.appendChild(overlay);

            const loadingAnimation = document.createElement("div");
            loadingAnimation.className = "aig-loading-animation";
            overlay.appendChild(loadingAnimation);

            const data = {
                action: form.getAttribute("data-action"),
                nonce: form.querySelector("input[name='_wpnonce']").value,
                generate: 1,
                n: form.getAttribute("data-n"),
                size: form.getAttribute("data-size"),
                model: form.getAttribute("data-model"),
                download: form.getAttribute("data-download"),
                prompt: promptWithValues,
                public_prompt: publicPrompt,
                topics: topics,
            };

            const ajaxurl = form.getAttribute("action");

            let requests = [];
            if (data.model === 'dall-e-3' && data.n > 1) {
                requests = Array.from({ length: data.n }, () => {
                    return fetch(ajaxurl, {
                        method: "POST",
                        body: new URLSearchParams(data),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Cache-Control": "no-cache",
                        },
                    }).then((response) => response.json());
                });
            } else {
                requests.push(fetch(ajaxurl, {
                    method: "POST",
                    body: new URLSearchParams(data),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Cache-Control": "no-cache",
                    },
                }).then((response) => response.json()));
            }

            try {
                const responses = await Promise.all(requests);
                const errors = [];
                const mergedResponse = responses.reduce((acc, response) => {
                    if (response.error && response.error.msg) {
                        errors.push(response.error.msg);
                    }
                    if (response.images && response.images.length > 0) {
                        acc.images = acc.images.concat(response.images);
                    }
                    return acc;
                }, { images: [] });
        
                overlay.style.display = "none";
                document.querySelector(".aig-results-separator").style.display = 'block';

                const errorContainer = document.querySelector(".aig-errors");
                if (errors.length > 0) {
                    errorContainer.innerHTML = errors.join('<br>');
                }

                const imageContainer = document.createElement("div");
                imageContainer.className = "custom-row";
                containerResults.appendChild(imageContainer);

                if (mergedResponse.images && mergedResponse.images.length > 0) {
                    mergedResponse.images.forEach((image, index) => {
                        const figure = document.createElement("figure");
                        figure.className = "custom-col";
    
                        const imgElement = document.createElement("img");
                        imgElement.src = image.url;
                        imgElement.className = "aig-image";
                        imgElement.alt = "Generated Image " + (index + 1);
                        figure.appendChild(imgElement);
    
                        const figCaption = document.createElement("figcaption");
                        const downloadButton = document.createElement("button");
                        downloadButton.setAttribute('type', 'button');
                        downloadButton.className = "aig-download-button";
    
                        const label = form.getAttribute("data-download") === "manual" ? 'Download Image ' + (index + 1) : 'Use Image ' + (index + 1) + ' as profile picture';
                        downloadButton.innerHTML = '<span class="dashicons dashicons-download"></span> ' + label;
                        figCaption.appendChild(downloadButton);
    
                        figure.appendChild(figCaption);
                        imageContainer.appendChild(figure);
    
                        // Image download management
                        downloadButton.addEventListener("click", function () {
                            if (form.getAttribute("data-download") === "manual") {
                                const link = document.createElement("a");
                                link.href = image.url;
                                link.target = '_blank';
                                link.download = "image" + (index + 1) + ".png";
                                link.style.display = "none";
    
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            } else if (form.getAttribute("data-download") === "wp_avatar") {
                                fetch(ajaxurl, {
                                    method: "POST",
                                    body: new URLSearchParams({
                                        action: "change_wp_avatar",
                                        image_url: image.url,
                                    }),
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded",
                                        "Cache-Control": "no-cache",
                                    },
                                })
                                    .then((response) => response.json())
                                    .then((result) => {
                                        if (confirm("You have successfully changed your profile picture.")) {
                                            window.location.reload();
                                        }                                        
                                    })
                                    .catch((error) => {
                                        console.error("Error API request :", error);
                                    });
                            } else if (form.getAttribute("data-download") === "wc_avatar") {
                                fetch(ajaxurl, {
                                    method: "POST",
                                    body: new URLSearchParams({
                                        action: "change_wc_avatar",
                                        image_url: image.url,
                                    }),
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded",
                                        "Cache-Control": "no-cache",
                                    },
                                })
                                    .then((response) => response.json())
                                    .then((result) => {
                                        console.log("Photo de profil WooCommerce changée avec succès.");
                                    })
                                    .catch((error) => {
                                        console.error("Erreur lors de la requête API :", error);
                                    });
                            }
                        });
    
                    });
                }
        
            } catch (error) {
                console.error("Erreur lors de la requête API :", error);
            }
        });
    }
});
