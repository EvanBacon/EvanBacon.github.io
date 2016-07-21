$(function () {

	var isDesktop = true;

	if ($('#desktopTest').is(':hidden')) {
    isDesktop = false;
	}


	function introLogo () {
		var i = 0, speed = 250, delay = 100;
		$('#urbane-logo img').each(function () {
			$(this).velocity({ top: -5, opacity: 1.0 }, {
				delay: delay * i,
				duration: speed,
				easing: 'easeOutSine',
				complete: function () {
					$(this).velocity({ top: 0 }, {
						duration: speed,
						easing: 'easeInSine'
					});
				}
			});
			i = i + 1;
		});
	}

	introLogo();

	$('#urbane-logo').click(function () {

		var i = 0, speed = 150, delay = 50;
		$('#urbane-logo img').each(function () {
			$(this).velocity({ top: -5 }, {
				delay: delay * i,
				duration: speed,
				easing: 'easeOutSine',
				complete: function () {
					$(this).velocity({ top: 0 }, {
						duration: speed,
						easing: 'easeInSine'
					});
				}
			});
			i = i + 1;
		});

	});

	$('#fabric-logo').bind('inview', function () {
		var i = 0, speed = 1000, delay = 250;
		$('.fabric-logo-layer').each(function () {
			$(this).velocity({ top: 0, opacity: 1.0 }, {
				delay: delay * i,
				duration: speed,
				easing: 'easeOutSine'
			});
			i = i + 1;
		});
	});

	$('.iphone-screen-row-first').bind('inview', function () {
	  $('.iphone-screen-row-first .iphone-screen').velocity({ opacity: 1.0, top: 0, left: 0, right: 0 }, 2000, 'easeOutQuart');
	});

	$('.iphone-screen-row-second').bind('inview', function () {
	  $('.iphone-screen-row-second .iphone-screen').velocity({ opacity: 1.0, top: 0, left: 0, right: 0 }, 2000, 'easeOutQuart');
	});

	$('.kit').bind('inview', function () {

		var i = 0, speed = 1000, delay = 100;
		$('.kit').each(function () {
			$(this).velocity({ top: 0, opacity: 1.0 }, {
				delay: delay * i,
				duration: speed,
				easing: 'easeOutQuart'
			});
			i = i + 1;
		});
	});

	$('.kit-icon').mouseover(function () {

		$(this).velocity({ top: -5,
		  boxShadowX: "0",
		  boxShadowY: "5px",
		  boxShadowBlur: "10px",
		}, 250, 'easeOutQuart');
	});

	$('.kit-icon').mouseleave(function () {

		$(this).velocity({ top: 0,
		  boxShadowX: "0",
		  boxShadowY: "0",
		  boxShadowBlur: "0",
		}, 500, 'easeOutQuart');
	});

	var videoTmpl = $('#video-tmpl').html();

	$('#videoModal').on('show.bs.modal', function (e) {
		$('#videoModal .modal-body').html(videoTmpl);
	});

	$('#videoModal').on('hidden.bs.modal', function (e) {
		$('#videoModal .modal-body').html('');
	});
});
