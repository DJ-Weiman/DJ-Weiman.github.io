import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { SqliteService } from 'src/app/services/sqlite.service';
import { deleteDatabase } from 'src/assets/db-utils';
import { createSchema } from 'src/assets/martis-utils';
import { Repair } from 'src/app/services/database.service';
import { RepairListService } from 'src/app/services/repair-list.service';

@Component({
	selector: 'app-repair-list',
	templateUrl: './repair-list.page.html',
	styleUrls: [ './repair-list.page.scss' ]
})
export class RepairListPage implements OnInit {
	repairs = [];
	log: string = '';
	platform: string;
	handlerPermissions: any;
	initPlugin: boolean = false;

	constructor(
		private _RepairListService: RepairListService,
		private plt: Platform,
		private _sqlite: SqliteService,
		private alertCtrl: AlertController
	) {}

	lst: any = [];
	lest: Repair[] = [];
	desktop: boolean = true;

	async ngOnInit() {
		const showAlert = async (message: string) => {
			let msg = this.alertCtrl.create({
				header: 'Error',
				message: message,
				buttons: [ 'OK' ]
			});
			(await msg).present();
		};

		if (this.plt.is('mobile') || this.plt.is('android') || this.plt.is('ios')) {
			this.desktop = false;
			try {
				await this.runTest();
				this.log += '\n$$$ runTest was successful\n';
			} catch (err) {
				this.log += '\n ' + err.message;
				await showAlert(err.message);
			}
		} else if (this.plt.is('desktop')) {
			this._RepairListService.getrepairs().subscribe((data) => {
				this.lst = data;
				this.lst = Array.of(this.lst.data);

				console.log(this.lst);
			});
		}
	}
	async runTest(): Promise<void> {
		try {
			let result: any = await this._sqlite.echo('Hello World');
			this.log += ' from Echo ' + result.value;
			// initialize the connection
			const db = await this._sqlite.createConnection('martis', false, 'no-encryption', 1);
			this.log += '\ndb connected ' + db;

			
			// open db testNew
			await db.open();
			this.log += '\ndb opened';
			
			// create synchronization table
			// let ret: any = await db.createSyncTable();
			// console.log('$$$ createSyncTable ret.changes.changes in db ' + ret.changes.changes);

			// // set the synchronization date
			// const syncDate: string = '2020-11-25T08:30:25.000Z';
			// await db.setSyncDate(syncDate);

			// select all assets in db
			let ret = await db.query('SELECT * FROM repair;');
			this.repairs = ret.values;
			if (ret.values.length === 0) {
				return Promise.reject(new Error('Query 2 repair failed'));
			}
			this.log += '\nquery done.';
			// Close Connection MyDB
			await this._sqlite.closeConnection('martis');
			this.log += "\n> closeConnection 'martis' successful\n";

			return Promise.resolve();
		} catch (err) {
			// Close Connection MyDB
			await this._sqlite.closeConnection('martis');
			this.log += "\n> closeConnection 'martis' successful\n";

			this.log += '\nrejected';
			return Promise.reject(err);
		}
	}
}
