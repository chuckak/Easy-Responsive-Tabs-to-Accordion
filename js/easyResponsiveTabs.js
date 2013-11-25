// Easy Responsive Tabs Plugin
// Author: Samson.Onna <Email : samson3d@gmail.com>
(function ($) {
    'use strict';
    $.fn.extend({
        easyResponsiveTabs: function (opts) {
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                    type: 'default', //default, vertical, accordion;
                    width: 'auto',
                    fit: true,
                    closed: false,
                    activate: function () { return false; }
                },
                options = $.extend(defaults, opts),
                hash = window.location.hash,
                historyApi = !!(window.history && history.replaceState);

            //Events
            $(this).bind('tabactivate', function (e, currentTab) {
                if (typeof options.activate === 'function') {
                    options.activate.call(currentTab, e);
                }
            });

            //Main function
            this.each(function () {
                var $respTabs = $(this),
                    $respTabsList = $respTabs.find('ul.resp-tabs-list'),
                    respTabsId = $respTabs.attr('id'),
                    matches = hash.match(new RegExp(respTabsId + '([0-9]+)')),
                    tabCount = 0,
                    tabNum = 0,
					tabOptions = function () { //Properties Function
						$respTabs.css({
							'display': 'block',
							'width': options.width
						});
						switch (options.type) {
							case 'vertical':
								$respTabs.addClass('resp-vtabs');
								break;
							case 'accordion':
								$respTabs.addClass('resp-easy-accordion');
								$respTabs.find('.resp-tabs-list').css('display', 'none');
								break;
						}
						if (options.fit == true) {
							$respTabs.css({ width: '100%', margin: '0px' });
						}
					};

                tabOptions();

				$respTabs.find('ul.resp-tabs-list li').addClass('resp-tab-item');
				$respTabs.find('.resp-tabs-container > div').addClass('resp-tab-content');
				
                //Assigning the h2 markup to accordion title
                $respTabs.find('.resp-tab-content').before('<h2 class="resp-accordion" role="tab"><span class="resp-arrow"></span></h2>');

                $respTabs.find('.resp-accordion').each(function (i) {
                    var $tabItem = $respTabs.find('.resp-tab-item:eq(' + i + ')'),
                        $accItem = $respTabs.find('.resp-accordion:eq(' + i + ')');
                    $accItem.append($tabItem.html()).data($tabItem.data());
                    $(this).attr('aria-controls', 'tab_item-' + i);
                });

                //Assigning the 'aria-controls' to Tab items
                $respTabs.find('.resp-tab-item').each(function () {
                    $(this).attr('aria-controls', 'tab_item-' + tabCount);
                    $(this).attr('role', 'tab');

                    //Assigning the 'aria-labelledby' attr to tab-content
                    $respTabs.find('.resp-tab-content').each(function (i) {
                        $(this).attr('aria-labelledby', 'tab_item-' + i);
                    });
                    tabCount = tabCount + 1;
                });

                // Show correct content area
                if (hash !== '') {
                    if (matches !== null && matches.length === 2) {
                        tabNum = parseInt(matches[1], 10) - 1;
                        if (tabNum > tabCount) {
                            tabNum = 0;
                        }
                    }
                }

                //Active correct tab
                $($respTabs.find('.resp-tab-item')[tabNum]).addClass('resp-tab-active');

                //keep closed if option = 'closed' or option is 'accordion' and the element is in accordion mode
                if (options.closed !== true && !(options.closed === 'accordion' && !$respTabsList.is(':visible')) && !(options.closed === 'tabs' && $respTabsList.is(':visible'))) {
                    $($respTabs.find('.resp-accordion')[tabNum]).addClass('resp-tab-active');
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active').attr('style', 'display:block');
                } else { //assign proper classes for when tabs mode is activated before making a selection in accordion mode
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active resp-accordion-closed');
                }

                //Tab Click action function
                $respTabs.find('[role=tab]').each(function () {
                    $(this).click(function () {
                        var $currentTab = $(this),
                            $tabAria = $currentTab.attr('aria-controls'),
                            currentHash = window.location.hash,
                            newHash = respTabsId + (parseInt($tabAria.substring(9), 10) + 1).toString(),
                            re = new RegExp(respTabsId + '[0-9]+');

                        if ($currentTab.hasClass('resp-accordion') && $currentTab.hasClass('resp-tab-active')) {
                            $respTabs.find('.resp-tab-content-active').slideUp('', function () { $(this).addClass('resp-accordion-closed'); });
                            $currentTab.removeClass('resp-tab-active');
                            return false;
                        }
                        if (!$currentTab.hasClass('resp-tab-active') && $currentTab.hasClass('resp-accordion')) {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').slideUp().removeClass('resp-tab-content-active resp-accordion-closed');
                            $respTabs.find('[aria-controls=' + $tabAria + ']').addClass('resp-tab-active');

                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').slideDown().addClass('resp-tab-content-active');
                        } else {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').removeAttr('style').removeClass('resp-tab-content-active').removeClass('resp-accordion-closed');
                            $respTabs.find('[aria-controls=' + $tabAria + ']').addClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').addClass('resp-tab-content-active').attr('style', 'display:block');
                        }
                        //Trigger tab activation event
                        $currentTab.trigger('tabactivate', $currentTab);

                        //Update Browser History
                        if (historyApi) {
                            if (currentHash !== '') {
                                if (currentHash.match(re) !== null) {
                                    newHash = currentHash.replace(re, newHash);
                                } else {
                                    newHash = currentHash + '|' + newHash;
                                }
                            } else {
                                newHash = '#' + newHash;
                            }
                            history.replaceState(null, null, newHash);
                        }
                    });
                });

                //Window resize function                   
                $(window).resize(function () {
                    $respTabs.find('.resp-accordion-closed').removeAttr('style');
                });
            });
        }
    });
}(jQuery));
