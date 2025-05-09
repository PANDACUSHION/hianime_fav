// ==UserScript==
// @name         hianime favorites
// @namespace    http://tampermonkey.net/
// @version      2025-05-09
// @description  Add favorites functionality to HiAnime
// @author       PandaCushion
// @match        https://www.hianimes.to/watch/*
// @match        https://www.hianimes.to/home
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get anime information from the current page
    function watch_favorites(){
        const containerFav = document.getElementById('widget-continue-watching');
        if (!containerFav) return;

        try {
            const favorites = JSON.parse(localStorage.getItem('hianimefav') || '[]');
            console.log("Loaded favorites:", favorites);

            if (favorites.length > 0) {
                // Create a row div to hold the anime cards
                const rowDiv = document.createElement('div');
                rowDiv.className = 'block_area-content block_area-list film_list film_list-grid';

                // Create film list div
                const filmListDiv = document.createElement('div');
                filmListDiv.className = 'film_list-wrap';

                // Add header for favorites section
                const headerDiv = document.createElement('div');
                headerDiv.className = 'block_area-header';
                headerDiv.innerHTML = '<div class="cat-heading"><h2 class="cat-heading-title">My Favorites</h2></div>';
                containerFav.appendChild(headerDiv);

                favorites.forEach(animeData => {
                    if (animeData && animeData.film_poster) {
                        const card = createAnimeCard(animeData);
                        filmListDiv.appendChild(card);
                    }
                });

                rowDiv.appendChild(filmListDiv);
                containerFav.appendChild(rowDiv);
            }
        } catch (e) {
            console.error('Error loading favorites:', e);
        }
    }

    // Only run watch_favorites on the home page
    if (window.location.href.includes('/home')) {
        watch_favorites();
    }

    function createAnimeCard(animeData) {
        // Create the main container div
        const flwItem = document.createElement('div');
        flwItem.className = 'flw-item';

        // Create film-poster div
        const filmPoster = document.createElement('div');
        filmPoster.className = 'film-poster';

        // Create tick elements
        const tick = document.createElement('div');
        tick.className = 'tick ltr';
        const tickItem = document.createElement('div');
        tickItem.className = 'tick-item tick-sub';
        tickItem.innerHTML = '<i class="fas fa-closed-captioning mr-1"></i>';
        tick.appendChild(tickItem);
        filmPoster.appendChild(tick);

        // Create image element
        const posterImg = document.createElement('img');
        posterImg.src = animeData.film_poster;
        posterImg.className = 'film-poster-img lazyloaded';
        posterImg.alt = animeData.animeName;
        posterImg.style.width = '100%';
        posterImg.style.height = 'auto';
        filmPoster.appendChild(posterImg);

        // Create play link
        const playLink = document.createElement('a');
        playLink.href = animeData.film_url;
        playLink.className = 'film-poster-ahref item-qtip';
        playLink.setAttribute('data-hasqtip', '0');
        playLink.setAttribute('title', animeData.animeName);
        playLink.innerHTML = '<i class="fas fa-play"></i>';
        filmPoster.appendChild(playLink);

        // Create film-detail div
        const filmDetail = document.createElement('div');
        filmDetail.className = 'film-detail';

        // Create film name elements
        const filmName = document.createElement('h3');
        filmName.className = 'film-name';
        const nameLink = document.createElement('a');
        nameLink.href = animeData.film_info;
        nameLink.className = 'dynamic-name';
        nameLink.setAttribute('title', animeData.animeName);
        nameLink.textContent = animeData.animeName;
        filmName.appendChild(nameLink);
        filmDetail.appendChild(filmName);

        // Create fd-infor div
        const fdInfor = document.createElement('div');
        fdInfor.className = 'fd-infor';

        // Add TV type span
        const typeSpan = document.createElement('span');
        typeSpan.className = 'fdi-item';
        typeSpan.textContent = 'TV';
        fdInfor.appendChild(typeSpan);

        filmDetail.appendChild(fdInfor);

        // Assemble all elements
        flwItem.appendChild(filmPoster);
        flwItem.appendChild(filmDetail);

        return flwItem;
    }

    function getAnimeInfo() {
        const filmPosterUrl = document.querySelector('.film-poster-img')?.src || '';
        const getCurrentUrl = window.location.href;
        const animeNameElement = document.querySelector('.dynamic-name');
        const animeName = animeNameElement ? animeNameElement.textContent.trim() : '';
        const info_url = getCurrentUrl.replace('/watch/', '/');

        return {
            film_poster: filmPosterUrl,
            animeName: animeName,
            film_info: info_url,
            film_url: getCurrentUrl
        };
    }

    // Check if current anime is in favorites
    function isInFavorites(animeUrl) {
        try {
            const favorites = JSON.parse(localStorage.getItem('hianimefav') || '[]');
            return favorites.some(item => item.film_url === animeUrl);
        } catch (e) {
            console.error('Error checking favorites:', e);
            return false;
        }
    }

    // Toggle anime in favorites list
    function toggleFavorite(starIcon) {
        const animeInfo = getAnimeInfo();

        // Skip if we couldn't get anime info
        if (!animeInfo.animeName) {
            console.error('Could not get anime info');
            return;
        }

        // Get current favorites list
        let favorites;
        try {
            favorites = JSON.parse(localStorage.getItem('hianimefav') || '[]');
        } catch (e) {
            console.error('Error parsing favorites:', e);
            favorites = [];
        }

        const currentUrl = animeInfo.film_url;
        const isCurrentlyFavorited = isInFavorites(currentUrl);

        if (isCurrentlyFavorited) {
            // Remove from favorites
            favorites = favorites.filter(item => item.film_url !== currentUrl);
            // Update star to empty
            starIcon.classList.remove('fas');
            starIcon.classList.add('far');
            console.log('Removed from favorites');
        } else {
            // Add to favorites
            favorites.push(animeInfo);
            // Update star to filled
            starIcon.classList.remove('far');
            starIcon.classList.add('fas');
            console.log('Added to favorites');
        }

        // Save updated list
        try {
            localStorage.setItem('hianimefav', JSON.stringify(favorites));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }

    function loadStar() {
        const checkContainer = setInterval(() => {
            const ssChoiceContainer = document.querySelector('.ss-choice');
            if (ssChoiceContainer) {
                clearInterval(checkContainer);

                // Check if we've already added the button to avoid duplicates
                if (document.getElementById('ssc-favorite')) {
                    return;
                }
                const sscFavorite = document.createElement('div');
                sscFavorite.className = 'ssc-list';
                sscFavorite.style.float = 'left';
                sscFavorite.style.marginRight = '15px';

                const sscButton = document.createElement('div');
                sscButton.className = 'ssc-button';
                sscButton.id = 'ssc-favorite';
                sscButton.style.fontSize = '12px';
                sscButton.style.position = 'relative';

                const sscLabel = document.createElement('div');
                sscLabel.className = 'ssc-label';
                sscLabel.style.marginBottom = '0';
                sscLabel.style.fontWeight = '500';

                // Create the star icon
                const starIcon = document.createElement('i');
                starIcon.className = isInFavorites(window.location.href) ? 'fas fa-star' : 'far fa-star';
                starIcon.style.marginLeft = '100px';
                starIcon.style.cursor = 'pointer';
                starIcon.style.color = '#fff';

                // Add click event listener
                starIcon.addEventListener('click', function() {
                    toggleFavorite(this);
                });
                sscLabel.appendChild(starIcon);
                sscButton.appendChild(sscLabel);
                sscFavorite.appendChild(sscButton);

                // Position our new element
                const sscQuick = ssChoiceContainer.querySelector('.ssc-quick');
                if (sscQuick) {
                    ssChoiceContainer.insertBefore(sscFavorite, sscQuick);
                } else {
                    const clearfixDiv = ssChoiceContainer.querySelector('.clearfix');
                    if (clearfixDiv) {
                        ssChoiceContainer.insertBefore(sscFavorite, clearfixDiv);
                    } else {
                        ssChoiceContainer.appendChild(sscFavorite);
                    }
                }
            }
        }, 500);
    }

    // On watch pages, load the favorite star button
    if (window.location.href.includes('/watch/')) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            loadStar();
        } else {
            document.addEventListener('DOMContentLoaded', loadStar);
            window.addEventListener('load', loadStar);
        }
    }
})();