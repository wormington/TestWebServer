/**
 *  DispScript.js
 *  Author: Cade Wormington
 * 
 *  This script displays JSON from the backend to divs with the designated classes,
 *  'projects-list' and 'projects-preview-list'. It makes use of jQuery and Bootstrap 3.
 */

// defStr is the default HTML display if an error occurs.
const defStr = "<h3>Tell Cade to fix his code. :(</h3>";

/**
 * errorDisp() is a function which sets the error display in
 * case of an error. 
 * 
 * @param {string} errorStr 
 */
const errorDisp = function (errorStr) {
    $(".projects-list").html(defStr + '\n<p>Error: ' + errorStr + '</p>');
    $(".projects-preview-list").html(defStr + '\n<p>Error: ' + errorStr + '</p>');
};

/**
 * urlParam() is a function we define within jQuery to obtain parameters in the URL of
 * the webpage. It uses a regular expression to find and get these parameters.
 * 
 * @param {string} name 
 * @returns the requested parameter, if it exists.
 *          null, otherwise.
 */
$.urlParam = function (name) {
    let results = new RegExp('[/?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURI(results[1]) || null;
};

// The ready() function executes once the webpage has finished loading. It runs the callback
// function passed to it. 
$(document).ready(function () {
    // Once the document is loaded, we request the JSON from the server.
    $.getJSON("/repos.json", function (data, status) {
            if (status !== 'success') {
                errorDisp(status);
                return;
            }

            // Determine amount of pages and the page the user wants.
            let pages = Math.ceil(data.length / 5);
            let currentPage = parseInt($.urlParam("page"));
            if (!currentPage || currentPage > pages || currentPage <= 0) {
                // current page defaults to 1 if a page is not requested or if 
                // the page is out of range.
                currentPage = 1;
            }

            // Construct the HTML string for pagination that we wish to display.
            let pageStr = '';

            // If we are on the first page, disable previous page button.
            // Otherwise make it reference the previous page.
            if (currentPage === 1) {
                pageStr += `<li class="disabled"><a>&laquo;</a></li>\n`;
            } else {
                pageStr += `<li><a href="/projects.html?page=${currentPage - 1}">&laquo;</a></li>\n`;
            }

            // Display the right amount of pages, disable the option for the current page.
            for (let i = 1; i <= pages; i++) {
                if (i !== currentPage) {
                    pageStr += `<li><a href="/projects.html?page=${i}">${i}</a></li>\n`;
                } else {
                    pageStr += `<li class="active"><a>${i}</a></li>\n`;
                }
            }

            // If we are on the last page, disable next page button. Otherwise
            // make it reference the next page.
            if (currentPage === pages) {
                pageStr += `<li class="disabled"><a>&raquo;</a></li>`;
            } else {
                pageStr += `<li><a href="/projects.html?page=${currentPage + 1}">&raquo;</a></li>`;
            }

            $(".project-pages").html(pageStr);

            // Construct the HTML string for the projects-list and projects-preview-list HTML classes. 
            let listStr = "";
            let prevStr = "";

            // We display, at most, 5 Github repos in the projects-list. 
            for (let i = 0; i < Math.min(5, data.length - ((currentPage - 1) * 5)); i++) {
                // currentRepo is an object containing the summarized information for a 
                // specific repository.
                let currentRepo = data[(currentPage - 1) * 5 + i];

                // We display, at most, 3 Github repos in the projects-preview-list.
                if (i < 3) {
                    // Concatenate the HTML string to display each repo in projects-preview-list.
                    prevStr += `<div class="col-md-4 col-sm-12">
                    <a href="${currentRepo.url}" target="_blank">
					    <div class="projects-preview col-md-12">
							<h4>/${currentRepo.name}</h4>
							<p>Last Commit Date: ${currentRepo.updated}
								<br/>
								Owner: ${currentRepo.owner}
								<br/>
								Description: ${currentRepo.description}
							</p>
                        </div>
                    </a>
				</div>\n`;
                }

                // Concatenate the HTML string to display each repo in projects-list.
                listStr += `<a href="${currentRepo.url}" target="_blank">
                <div class="row projects-item col-md-12 col-sm-12">
                    <h4>/${currentRepo.name}</h4>
                    <p>Last Commit Date: ${currentRepo.updated}
                        <br/>
                        Owner: ${currentRepo.owner}
                        <br/>
                        Description: ${currentRepo.description}
                    </p>
                </div>
            </a>\n`;
            }

            // Finally, display the HTML strings.
            $(".projects-list").html(listStr);
            $(".projects-preview-list").html(prevStr);
        }
    );
});

