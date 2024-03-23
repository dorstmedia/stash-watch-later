// ==UserScript==
// @name        Stash Watch Later Button
// @icon        https://raw.githubusercontent.com/dorstmedia/stash-watch-later/master/stashapp-favicon.ico
// @require     https://raw.githubusercontent.com/stg-annon/stash-userscripts/main/src/StashUserscriptLibrary.js
// @downloadURL https://raw.githubusercontent.com/dorstmedia/stash-watch-later/master/stash-watch-later.js
// @updateURL   https://raw.githubusercontent.com/dorstmedia/stash-watch-later/master/stash-watch-later.js
// @namespace   https://github.com/dorstmedia/stash-watch-later
// @version     0.1.1.1
// @description Adds button to toggle Watch Later Tags for Scene
// @author      dorstmedia
// @match       http://localhost:9999/*
// @exclude     http://localhost:9999/settings?tab=logs
// @grant       unsafeWindow
// @grant       GM_addStyle
// ==/UserScript==

(function () {
    'use strict';
	const {
		stash: stash$1
	} = unsafeWindow.stash;
    const {
        stash,
        Stash,
        waitForElementId,
        waitForElementClass,
        waitForElementByXpath,
        getElementByXpath,
        insertAfter,
        createElementFromHTML,
    } = unsafeWindow.stash;
   	/**
	 * Updates a scene with the given scene_id and tag_ids.
	 * @param {string} scene_id - The ID of the scene to update.
	 * @param {Array<string>} tag_ids - An array of tag IDs to associate with the scene.
	 * @returns {Promise<Object>} - A promise that resolves with the updated scene object.
	 */
    function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	async function updateScene(scene_id, tag_ids) {
		const reqData = {
			variables: {
				input: {
					id: scene_id,
					tag_ids: tag_ids
				}
			},
			query: `mutation sceneUpdate($input: SceneUpdateInput!){
  sceneUpdate(input: $input) {
    id
  }
}`,
		};
		return stash$1.callGQL(reqData);
	}

    async function addTag2Scene(scene_id,tag_id,callback){
        tag_id=tag_id.toString();
        let existingTags = await getTagsForScene(scene_id);
        let newTags=[];
        if (!existingTags.includes(tag_id)){
            newTags=existingTags;
            newTags.push(tag_id);
        }else{
            for (const existingTag of existingTags) {
                if(existingTag != tag_id) newTags.push(existingTag);
            }
        }
        console.log("newTags",newTags);
        await updateScene(scene_id,newTags);
        if(typeof callback == 'function') callback();
        //loopScenes();
    }
	async function getTagsForScene(scene_id) {
		const reqData = {
			query: `{
  findScene(id: "${scene_id}") {
    tags {
      id
    }
  }
}`,
		};
		var result = await stash$1.callGQL(reqData);
        //return result;
		return result.data.findScene.tags.map((p) => p.id);
	}
    async function loopScenes(){
		await sleep(1000);
        for (let sceneID in stash.scenes){
            if(typeof sceneID == 'undefined' || sceneID == null) continue;

            const sceneLink = document.querySelector('.scene-card a[href*="scenes/'+sceneID+'"]');
            if(typeof sceneLink == 'undefined' || sceneLink == null) continue;
            const sceneUrl = sceneLink.href;
            if(typeof sceneUrl == 'undefined' || sceneUrl == null) continue;
            const sceneCard = sceneLink.parentElement;
            if(typeof sceneCard == 'undefined' || sceneCard == null) continue;
            let tags = await getTagsForScene(sceneID);

            let wlBtnStyle="opacity: 0.5;";
            if (tags.includes('3060')) wlBtnStyle="color:#ff7373; opacity: 1;"

            const wlBtn=createElementFromHTML('<a style="position: absolute;  left: .65rem; bottom: 1.4%;" href="#" data-sceneID="'+sceneID+'" id="wl_btn_scene_'+sceneID+'" class="wl_btn_scene"><button style="'+wlBtnStyle+'" type="button" class="minimal mousetrap favorite-button not-favorite btn btn-primary"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-2x fa-icon " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg></button></a>');
            document.querySelectorAll('#wl_btn_scene_'+sceneID).forEach(e => e.remove());
            sceneCard.appendChild(wlBtn);
            wlBtn.addEventListener('click', function(event) {
                event.preventDefault();
                this.innerHTML='<div role="status" class="spinner-border"></div>';

                console.log('Button ' + this.id + ' clicked', this.getAttribute('data-sceneID'));
                addTag2Scene(this.getAttribute('data-sceneID'),3060,loopScenes)
                //let tags = getTagsForScene(this.getAttribute('data-sceneID'));
           });
        }

    }
    async function loopScene(){
		await sleep(1000);
        const sceneID = window.location.pathname.split('/').pop();
        if(typeof sceneID != 'undefined' && sceneID != null){

            let tags = await getTagsForScene(sceneID);

            console.log("tags",tags);
            let wlBtnStyle="font-size: 0.65rem;";
            if (tags.includes('3060')) wlBtnStyle=wlBtnStyle+" color:#ff7373;"

            const wlBtn=createElementFromHTML('<div class="nav-item"><a href="#" data-sceneID="'+sceneID+'" id="wl_btn_scene_'+sceneID+'" class="wl_btn_scene"><button title="Watch Later" style="'+wlBtnStyle+'" type="button" class="minimal mousetrap favorite-button not-favorite btn btn-primary"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-2x fa-icon " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg></button></a></div>');

            const nav_tabs=document.querySelector('.scene-tabs .nav-tabs');
            document.querySelectorAll('#wl_btn_scene_'+sceneID).forEach(e => e.remove());
            nav_tabs.appendChild(wlBtn);
            document.getElementById('wl_btn_scene_'+sceneID).addEventListener('click', function(event) {
                event.preventDefault();
                this.innerHTML='<div role="status" class="spinner-border"></div>';
                console.log('Button ' + this.id + ' clicked', this.getAttribute('data-sceneID'));
                addTag2Scene(this.getAttribute('data-sceneID'),3060,loopScene)
                //let tags = getTagsForScene(this.getAttribute('data-sceneID'));
            });
        }
    }
    stash.addEventListener('page:scene', function () {
        console.log('event page:scenes');
        waitForElementClass("scene-tabs", function () {
            loopScene();
        });
    });
    stash.addEventListener('page:scenes', function () {
        console.log('event page:scenes');
        waitForElementClass("scene-card", function () {
            loopScenes();
        });
    });
    stash.addEventListener('page:studio', function () {
        console.log('event page:studio');
        waitForElementClass("scene-card", function () {
            loopScenes();
        });
    });
    stash.addEventListener('page:performer', function () {
        console.log('event page:performer');
        waitForElementClass("scene-card", function () {
            loopScenes();
        });
    });
    stash.addEventListener('page:tag', function () {
        console.log('event page:tag');
        waitForElementClass("scene-card", function () {
            loopScenes();
        });
    });
    window.navigation.addEventListener("navigate", (event) => {
        loopScenes();
    });
  
})();
