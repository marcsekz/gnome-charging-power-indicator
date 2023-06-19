const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;

let active;

var ChargingPowerIndicator = GObject.registerClass(
    class ChargingPowerIndicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, "Charging Power Indicator", false);

            this._icon = new St.Icon({
                icon_name: 'battery-full-charged-symbolic',
                style_class: 'system-status-icon'
            });
            // this.actor.add_child(this._icon);

            this._powerLabel = new St.Label({
                text: '0W',
                // y_expand: true,
                y_align: Clutter.ActorAlign.CENTER
            });
            this.actor.add_child(this._powerLabel);
            this.actor.reactive = false;
            active = true;

            // this._updatePower();

            // this._powerMonitor = Gio.File.new_for_path('/sys/class/power_supply/BAT0/power_now').monitor_file(Gio.FileMonitorFlags.NONE, null);
            // this._powerMonitor.connect('changed', Lang.bind(this, this._updatePower));
        }

        _updatePower() {
            let file1 = Gio.File.new_for_path('/sys/class/power_supply/BAT0/status');
            let [, contents1] = file1.load_contents(null);

            if (contents1.toString().trim() == "Charging")
            {
                if (!active)
                {
                    this.actor.show();
                    active = true;
                }
                let file = Gio.File.new_for_path('/sys/class/power_supply/BAT0/power_now');
                let [, contents] = file.load_contents(null);

                let power = parseFloat(contents.toString().trim()) / 1000000; // Convert to Watts
                this._powerLabel.set_text(power.toFixed(2) + 'W');
            }
            else
            {
                // this._powerLabel.set_text(contents1.toString());
                this._powerLabel.set_text('');
                if (active)
                {
                    this.actor.hide();
                    active = false;
                }
            }

            // this._powerLabel.set_text("Helllo")
        }

        destroy() {
            this._powerMonitor.cancel();
            this._powerMonitor = null;

            super.destroy();
        }
    }
);

function init() {
    // initialization code
}

let chargingPowerIndicator;

function update() {
    chargingPowerIndicator._updatePower();
    return GLib.SOURCE_CONTINUE;;
}

function enable() {
    chargingPowerIndicator = new ChargingPowerIndicator();
    Main.panel.addToStatusArea('charging-power-indicator', chargingPowerIndicator);
    timeout=GLib.timeout_add(GLib.PRIORITY_DEFAULT_IDLE, 1000, update);
}

function disable() {
    chargingPowerIndicator.destroy();
    chargingPowerIndicator = null;
}
