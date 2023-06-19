const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const UPowerGlib = imports.gi.UPowerGlib;

const ChargingPowerIndicator = new Lang.Class({
    Name: 'ChargingPowerIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Charging Power Indicator", false);
        this._icon = new St.Icon({
            icon_name: 'battery-full-charged-symbolic',
            style_class: 'system-status-icon'
        });
        this.actor.add_child(this._icon);

        this._powerLabel = new St.Label({
            text: '0W',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });
        this.actor.add_child(this._powerLabel);

        this._updatePower();

        let upClient = UPowerGlib.Client.new();
        upClient.connect('notify::on-battery', Lang.bind(this, this._updatePower));
    },

    _updatePower: function() {
        let upClient = UPowerGlib.Client.new();
        let devices = upClient.get_devices();
        let power = 0;

        for (let i = 0; i < devices.length; i++) {
            let device = devices[i];
            if (device.is_present() && device.is_rechargeable() && device.get_state() === UPowerGlib.DeviceState.CHARGING) {
                power += device.get_power();
            }
        }

        this._powerLabel.set_text(power.toFixed(2) + 'W');
    },

    destroy: function() {
        this.parent();
    }
});

function init() {
    // initialization code
}

let chargingPowerIndicator;

function enable() {
    chargingPowerIndicator = new ChargingPowerIndicator();
    Main.panel.addToStatusArea('charging-power-indicator', chargingPowerIndicator);
}

function disable() {
    chargingPowerIndicator.destroy();
    chargingPowerIndicator = null;
}
