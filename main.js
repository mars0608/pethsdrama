
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    const isDesktop = !isMobile;
    
    return { isIOS, isAndroid, isMobile, isDesktop };
}

function shouldShowAddToHomeScreen() {
    const { isIOS, isAndroid, isMobile, isDesktop } = detectDevice();
    
    // Debug logging
    console.log('🔍 Device Detection:', { isIOS, isAndroid, isMobile });
    
    // TEMPORARY: Show for all devices (including desktop for testing)
    // TODO: Change back to mobile-only for production
    // Commented out mobile-only check for testing
    // if (!isMobile) {
    //     console.log('❌ Desktop detected - not showing prompt');
    //     return false;
    // }
    
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('addToHomeScreenDismissed');
    console.log('🔍 Dismissed status:', dismissed);
    if (dismissed === 'true') {
        console.log('❌ User previously dismissed - not showing prompt');
        return false;
    }
    
    // Check if app is already installed (for PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('❌ App already installed - not showing prompt');
        return false;
    }
    
    console.log('✅ Showing Add to Home Screen prompt');
    return true;
}

function createAddToHomeScreenModal() {
    const { isIOS, isAndroid } = detectDevice();
    
    const modal = document.createElement('div');
    modal.id = 'add-to-home-screen-modal';
    modal.className = 'add-to-home-screen-modal';
    modal.addEventListener('touchmove', (e) => {
        if (e.target === modal) {
            e.preventDefault();
        }
    }, { passive: false });
    
    const content = document.createElement('div');
    content.className = 'add-to-home-screen-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Add PETHS Drama to Home Screen';
    title.className = 'add-to-home-screen-title';
    
    const instructions = document.createElement('div');
    instructions.className = 'add-to-home-screen-instructions';
    
    if (isIOS) {
        instructions.innerHTML = `
            <p>To add this website to your home screen:</p>
            <ol>
                <li>Tap the <strong>Share</strong> button <span class="share-icon">⎋</span> at the bottom of your screen</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
            </ol>
        `;
    } else if (isAndroid) {
        instructions.innerHTML = `
            <p>To add this website to your home screen:</p>
            <ol>
                <li>Tap the <strong>Menu</strong> button ⋮ in your browser</li>
                <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
            </ol>
        `;
    } else {
        // Desktop instructions
        instructions.innerHTML = `
            <p>To add this website to your home screen on mobile:</p>
            <ol>
                <li><strong>On iPhone:</strong> Use Safari, tap Share button, then "Add to Home Screen"</li>
                <li><strong>On Android:</strong> Use Chrome, tap Menu (⋮), then "Add to Home screen"</li>
                <li>This will create an app-like icon on your phone's home screen</li>
            </ol>
            <p style="margin-top: 15px; font-style: italic; color: var(--config-textColor2);">
                💡 Tip: Open this website on your phone to get device-specific instructions!
            </p>
        `;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'add-to-home-screen-buttons';
    
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Not Now';
    dismissButton.className = 'add-to-home-screen-dismiss';
    dismissButton.onclick = () => {
        localStorage.setItem('addToHomeScreenDismissed', 'true');
        hideAddToHomeScreenModal(modal);
    };
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Got It!';
    closeButton.className = 'add-to-home-screen-close';
    closeButton.onclick = () => {
        hideAddToHomeScreenModal(modal);
    };
    
    buttonContainer.appendChild(dismissButton);
    buttonContainer.appendChild(closeButton);
    
    content.appendChild(title);
    content.appendChild(instructions);
    content.appendChild(buttonContainer);
    modal.appendChild(content);
    
    return modal;
}

function showAddToHomeScreenPrompt() {
    console.log('🔍 showAddToHomeScreenPrompt called');
    const shouldShow = shouldShowAddToHomeScreen();
    console.log('📋 Should show prompt:', shouldShow);
    
    if (shouldShow) {
        console.log('✅ Creating and showing modal');
        const modal = createAddToHomeScreenModal();
        document.body.appendChild(modal);
        console.log('📱 Modal added to DOM');
        lockBodyScroll();
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
            console.log('🎭 Modal animation started');
        }, 100);
    } else {
        console.log('❌ Not showing modal');
    }
}

let a2hsScrollPosition = 0;
function lockBodyScroll() {
    a2hsScrollPosition = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.add('a2hs-no-scroll');
    document.body.style.top = `-${a2hsScrollPosition}px`;
}

function unlockBodyScroll() {
    document.body.classList.remove('a2hs-no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, a2hsScrollPosition);
}

function hideAddToHomeScreenModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
        unlockBodyScroll();
    }, 200);
}

// Initialize Add to Home Screen functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting Add to Home Screen check');
    console.log('🌐 Browser:', navigator.userAgent);
    console.log('💾 localStorage available:', typeof localStorage !== 'undefined');
    
    // Delay showing the prompt to let the page load
    setTimeout(() => {
        console.log('⏰ 2 seconds passed - checking if should show prompt');
        showAddToHomeScreenPrompt();
    }, 2000);
    
    // Scroll-triggered animations removed per request
    
    // Add event listener for the disable prompt button
    const disableButton = document.getElementById('disable-home-screen-prompt');
    if (disableButton) {
        disableButton.addEventListener('click', () => {
            localStorage.setItem('addToHomeScreenDismissed', 'true');
            disableButton.textContent = 'Prompt disabled';
            disableButton.style.opacity = '0.6';
            disableButton.disabled = true;
            
            // Show a brief confirmation
            const originalText = disableButton.textContent;
            disableButton.textContent = 'Disabled!';
            setTimeout(() => {
                disableButton.textContent = originalText;
            }, 2000);
        });
    }
});

const pageIdMeta = document.querySelector('meta[name="ts:pageId"]');
const pageId = pageIdMeta ? pageIdMeta.getAttribute('value') : 'home';
if(pageId==='home'){setTimeout(()=>{const videos=document.getElementsByTagName('video');for(const video of videos){video.setAttribute('poster',video.getAttribute('deferred-poster'))}},500);}
if(pageId==='handbook'){let showSidebar=false;let showSearchInput=undefined;let searchString="";let searchStringOverride="";let oldSearchStringOverride=undefined;let oldSearchString=undefined;let searchResultGroups=[];const sidebarButton=document.querySelector('.hb-sidebar-button');const sidebarNav=document.querySelector('.hb-sidebar');const closeSidebarClickTarget=document.querySelector('.hb-close-sidebar-click-target');const searchButton=document.querySelector('.search-button');const searchButtonImage=searchButton.querySelector('img');const searchForm=document.getElementById('handbook-search');const searchInput=document.querySelector('.search');const handbookToolbarDiv=document.querySelector('.hb-toolbar');const handbookToolbarContentAreaDiv=handbookToolbarDiv.querySelector('.content-area');const handbookContainerDiv=document.querySelector('.hb-container');const handbookContentsForMarkdownDiv=document.querySelector('.hb-contents-md');const handbookContentsForSearchResultsDiv=document.querySelector('.hb-contents-search-results');const noSearchResultsMessage=document.getElementById('no-search-results-message');const lang=document.querySelector('meta[name="ts:lang"]').getAttribute('value');const langSubpath=lang==="en"?"":`${lang}/`;const REDIRECTS={'handbook/settings/general#appearance':'handbook/settings/appearance','handbook/settings/general#theme':'handbook/settings/appearance/#theme','handbook/settings/general#show-background-grid':'handbook/settings/appearance/#show-background-grid','handbook/text/text_layer#font-weight':'handbook/text/text_layer#font-style','handbook/settings/tools#pen-tilt-limits':'handbook/brushes/brush_settings#tilt-control-threshold','handbook/settings/general#pivot-editing-enabled':'handbook/settings/tools/#pivot-editing-enabled','handbook/colors/fill_tool#smooth':'handbook/settings/tools/#fill-smooth-edges'}
const currentPath=window.location.href.replace(".html","").replace('/#','#');for(const[fromPath,toPath]of Object.entries(REDIRECTS)){if(currentPath.endsWith(fromPath)&&!currentPath.endsWith(toPath)){const basePath=currentPath.replace(fromPath,"");const redirectPath=basePath+toPath;window.location.href=redirectPath;break;}}
const generatingPDFHandbook=window.location.search.includes("mode=pdf");if(generatingPDFHandbook){const rootDiv=document.getElementById('page-root')
rootDiv.classList.add('pdfgen');}
async function search(text){const module=await import('/search.js');return module.search(text,`/${langSubpath}handbook/search_index.json`);}
function refresh(){if(showSidebar){sidebarNav.classList.add('hb-sidebar-visible');}else{sidebarNav.classList.remove('hb-sidebar-visible');}
const searchParams=new URLSearchParams(window.location.search);const searchParamsQ=searchParams.get('q');if(searchStringOverride!==oldSearchStringOverride||searchParamsQ!==null){searchString=searchStringOverride||searchParamsQ;oldSearchStringOverride=searchStringOverride;}
if(searchString&&handbookContentsForMarkdownDiv.parentNode){handbookContainerDiv.removeChild(handbookContentsForMarkdownDiv);}else if(!searchString&&!handbookContentsForMarkdownDiv.parentNode){handbookContainerDiv.insertBefore(handbookContentsForMarkdownDiv,handbookContainerDiv.childNodes[2]);}
if(searchString&&!handbookContentsForSearchResultsDiv.parentNode){handbookContainerDiv.insertBefore(handbookContentsForSearchResultsDiv,handbookContainerDiv.childNodes[2]);}else if(!searchString&&handbookContentsForSearchResultsDiv.parentNode){handbookContainerDiv.removeChild(handbookContentsForSearchResultsDiv);}
if(searchString!==oldSearchString){if(searchString){search(searchString).then(results=>{let groups={};let orderedKeys=[];for(const result of results){let href=result.id;const anchorIndex=href.indexOf('#');if(anchorIndex>0){href=href.substring(0,anchorIndex);}
const pathComponents=href.split('/');const group=pathComponents[0];const page=pathComponents[1];const groupName=result.group;const pageName=result.page;const isOverviewPage=page==='overview';if(!groups[result.id]){groups[result.id]={group:groupName,page:pageName,isOverviewPage:isOverviewPage,entries:[]};orderedKeys.push(result.id);}
const resultGroup=groups[result.id];const preview=result.body!==""?result.body.substring(0,80)+"…":"";resultGroup.entries.push({href:result.id,title:result.title,preview:preview});}
searchResultGroups=[];for(const key of orderedKeys){searchResultGroups.push(groups[key]);}
refresh();});}else{searchResultGroups=[];}
oldSearchString=searchString;}
const hasSearchString=searchString!=null&&searchString!=="";const currentPath=window.location.pathname;const isRootHandbookPage=currentPath.endsWith(`/${langSubpath}handbook`)||currentPath.endsWith(`/${langSubpath}handbook/`)||currentPath.endsWith(`/${langSubpath}handbook/index.html`);if(showSearchInput===undefined){showSearchInput=hasSearchString||isRootHandbookPage;}
const searchIcon=showSearchInput?'/assets/images/cancel_search.svg':'/assets/images/search.svg';searchButtonImage.src=searchIcon;const hasSearchResults=searchResultGroups.length>0;if(showSearchInput&&!searchForm.parentNode){const focusedElement=document.activeElement;if(focusedElement!==searchInput){focusedElement.blur();}
searchForm.removeAttribute('hidden')
handbookToolbarContentAreaDiv.insertBefore(searchForm,handbookToolbarDiv.childNodes[3]);searchInput.focus();}else if(!showSearchInput&&searchForm.parentNode){searchInput.removeAttribute('autofocus')
handbookToolbarContentAreaDiv.removeChild(searchForm);}
if(searchString){while(handbookContentsForSearchResultsDiv.firstChild){handbookContentsForSearchResultsDiv.lastChild.remove();}
for(const group of searchResultGroups){for(const entry of group.entries){const pageName=group.isOverviewPage?group.group:group.page;const groupName=group.isOverviewPage?group.page:group.group;const isSubsection=entry.title!==group.page;const breadcrumbs=isSubsection?`${groupName} > ${pageName}`:groupName
const title=isSubsection?entry.title:pageName;const div=document.createElement('div');div.className='hb-search-result';const link=document.createElement('a');link.href=`/${langSubpath}handbook/${entry.href}`;link.onclick=()=>{searchStringOverride=undefined;refresh();return true;}
const h4=document.createElement('h4');h4.textContent=breadcrumbs;link.appendChild(h4);const h2=document.createElement('h2');h2.textContent=title;link.appendChild(h2);if(entry.preview){const p=document.createElement('p');p.textContent=entry.preview;link.appendChild(p);}
div.appendChild(link);handbookContentsForSearchResultsDiv.appendChild(div);}}
if(!hasSearchResults){handbookContentsForSearchResultsDiv.appendChild(noSearchResultsMessage);}}}
sidebarButton.onclick=()=>{showSidebar=!showSidebar;refresh();};closeSidebarClickTarget.onclick=()=>{showSidebar=false;refresh();};searchButton.onclick=()=>{showSearchInput=!showSearchInput;refresh();};let defaultSearchInputValue="";searchInput.defaultValue=defaultSearchInputValue;searchInput.oninput=()=>{searchStringOverride=searchInput.value;refresh();};const searchParams=new URLSearchParams(window.location.search);const searchParamsQ=searchParams.get('q');if(searchParamsQ!==null){searchInput.value=searchParamsQ;}
document.addEventListener('keydown',(event)=>{if(event.metaKey&&event.key==='p'){showSearchInput=true;searchInput.focus();searchInput.select();event.preventDefault();refresh();}});refresh();}