$(function () {

    /* =========================================================
       THEME: dark / light
       - First visit: follow the device/OS setting (also applied
         instantly in <head> to avoid a flash of the wrong theme).
       - Once the visitor picks a theme with the toggle, that
         choice is saved and takes over from the OS setting.
       - If they never choose manually, the site keeps following
         the OS setting live if it changes.
    ========================================================= */
    var $html = $('html');
    var mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function currentTheme() {
        return $html.attr('data-theme') === 'light' ? 'light' : 'dark';
    }

    function applyTheme(theme, persist) {
        $html.attr('data-theme', theme);
        if (persist) {
            try { localStorage.setItem('theme', theme); } catch (e) { }
        }
    }

    $('#themeToggle, #themeToggleMobile').on('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
    });

    // keep following the OS theme live, but only if the visitor
    // has never explicitly chosen one on this site
    if (mql) {
        var mqlListener = function (e) {
            var hasStoredPreference = false;
            try { hasStoredPreference = !!localStorage.getItem('theme'); } catch (err) { }
            if (!hasStoredPreference) applyTheme(e.matches ? 'dark' : 'light', false);
        };
        if (mql.addEventListener) mql.addEventListener('change', mqlListener);
        else if (mql.addListener) mql.addListener(mqlListener); // older Safari
    }

    /* ---------- footer year ---------- */
    $('#year').text(new Date().getFullYear());

    /* ---------- topbar shadow on scroll + progress bar ---------- */
    var $topbar = $('#topbar');
    var $progressBar = $('#scrollBar');
    var $sections = $('main section[id]');
    var $tabs = $('[data-tab]');

    function updateActiveTab() {
        var scrollPos = $(window).scrollTop() + 140;
        var currentId = $sections.first().attr('id');
        $sections.each(function () {
            if ($(this).offset().top <= scrollPos) currentId = $(this).attr('id');
        });
        $tabs.each(function () {
            var $t = $(this);
            $t.toggleClass('is-active', $t.attr('href') === '#' + currentId);
        });
    }

    function onScroll() {
        var y = $(window).scrollTop();
        $topbar.toggleClass('is-scrolled', y > 10);

        var docHeight = $(document).height() - $(window).height();
        var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
        $progressBar.css('width', pct + '%');

        updateActiveTab();
    }
    $(window).on('scroll', onScroll);
    onScroll();

    /* ---------- mobile menu ---------- */
    var $burger = $('#burger');
    var $mobileMenu = $('#mobileMenu');
    $burger.on('click', function () {
        $burger.toggleClass('is-active');
        $mobileMenu.toggleClass('is-open');
    });
    $mobileMenu.find('a').on('click', function () {
        $burger.removeClass('is-active');
        $mobileMenu.removeClass('is-open');
    });

    /* ---------- reveal on scroll ---------- */
    var $revealTargets = $(
        '.about__grid, .gitlog .commit, .skills__grid .skillcard, .projects__grid .project, .contact__grid'
    ).addClass('reveal');

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    $(entry.target).addClass('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        $revealTargets.each(function () { io.observe(this); });
    } else {
        $revealTargets.addClass('is-visible');
    }

    /* ---------- hero: typed code editor ---------- */
    var codeLines = [
        '<span class="k">const</span> <span class="n">developer</span> <span class="p">=</span> <span class="p">{</span>',
        '&nbsp;&nbsp;name: <span class="s">\'M.A. Mohamed\'</span>,',
        '&nbsp;&nbsp;role: <span class="s">\'Full-Stack Engineer\'</span>,',
        '&nbsp;&nbsp;experience: <span class="f">\'3.5 years\'</span>,',
        '&nbsp;&nbsp;stack: [<span class="s">\'React\'</span>, <span class="s">\'Node\'</span>, <span class="s">\'Ionic\'</span>, <span class="s">\'Flutter\'</span>],',
        '&nbsp;&nbsp;<span class="f">shipProduct</span>() {',
        '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c">// 6 products, 3 companies</span>',
        '&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">return</span> <span class="k">true</span>;',
        '&nbsp;&nbsp;}',
        '<span class="p">};</span>'
    ];

    var $typedCode = $('#typedCode');

    function typeCode() {
        if (!$typedCode.length) return;
        $typedCode.empty();
        var i = 0;

        function nextLine() {
            if (i >= codeLines.length) {
                $('<div>').html('<span class="cursor"></span>').appendTo($typedCode);
                return;
            }
            var $row = $('<div>');
            $('<span>').addClass('ln').text(i + 1).appendTo($row);
            $('<span>').html(codeLines[i]).appendTo($row);
            $row.appendTo($typedCode);
            i++;
            setTimeout(nextLine, 140);
        }
        nextLine();
    }

    /* trigger the code typing once the hero editor scrolls into view (or immediately if already visible) */
    var editorEl = document.querySelector('.hero__editor');
    if (editorEl && 'IntersectionObserver' in window) {
        var codeIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    typeCode();
                    codeIO.disconnect();
                }
            });
        }, { threshold: 0.2 });
        codeIO.observe(editorEl);
    } else {
        typeCode();
    }

    /* ---------- status bar: rotating role text ---------- */
    var roles = ['Full-Stack Developer', 'Ionic & Flutter Engineer', 'React / Next.js Builder', 'Node.js Backend Dev'];
    var $roleEl = $('#typedRole');
    var roleIdx = 0, charIdx = 0, deleting = false;

    function tickRole() {
        if (!$roleEl.length) return;
        var current = roles[roleIdx];

        if (!deleting) {
            charIdx++;
            $roleEl.text(current.slice(0, charIdx));
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(tickRole, 1400);
                return;
            }
        } else {
            charIdx--;
            $roleEl.text(current.slice(0, charIdx));
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
            }
        }
        setTimeout(tickRole, deleting ? 35 : 65);
    }
    tickRole();

});