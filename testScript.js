var splitScreenAdded = 0;
$('div[data-hookscript="SplitScreen"]').each(function() {
    if (splitScreenAdded = 0) {
        var s = document.createElement( 'script' );
        s.setAttribute( 'src', "https://cdn.jsdelivr.net/gh/krisratcliffe/QM_JSD/includedscripts/SplitScreen.js" );
        document.body.appendChild( s );   
        this.append("<script>SplitScreen()</script>")
        var splitScreenAdded = 1;
        SplitScreen();
        //xys
    }    
});