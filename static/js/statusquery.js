class StatusQuery {
    constructor(interval_ms) {
        this.interval_ms = interval_ms
        this.callbacks = []
        this.updater = null
        var self = this
        $(function(){ self.start() });
    }
    register(func) {
        this.callbacks.push(func)
    }
    update() {
        this.callbacks.forEach(function (func){
            func();
        });
    }
    start() {
        var self = this
        this.updater = window.setInterval(function(){
            self.update();
        },
        this.interval_ms)
    }
}

var g_statusquery = new StatusQuery(500);
