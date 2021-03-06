import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import { SnotifyService } from 'ng-snotify';
import * as _ from "lodash";
import { Upload } from 'src/app/classes/upload.class';
import { UploadService } from 'src/app/services/upload/upload.service';

@Component({
  selector: 'app-element-admin',
  templateUrl: './element-admin.component.html',
  styleUrls: ['./element-admin.component.css']
})
export class ElementAdminComponent implements OnInit {
  elementoId: string;
  formGroup: FormGroup;
  elementoNombre = '';

  elementoSuscription: Subscription;


  selectedFiles: FileList;
  currentUpload: Upload;


  constructor(private formBuilder: FormBuilder, private dataService: DataService,
    private uploadService: UploadService,
    private route: ActivatedRoute, private router: Router, private snotifyService: SnotifyService) {
    this.elementoNombre = this.route.snapshot.params['elementName'];
    this.iniciarElemento();
    if (this.elementoNombre) {
      this.cargarElemento(this.elementoNombre);
    }
  }

  cargarElemento = (nombre: string) => {
    this.elementoSuscription = this.dataService.getElementosByName(nombre).subscribe((elementos) => {
 
      if (elementos[0]) {
        this.elementoId = elementos[0].id;

        this.formGroup.patchValue({
          descripcion: elementos[0].descripcion,
          nombre: elementos[0].nombre,

          imagenes: elementos[0].imagenes,
          referencia: elementos[0].referencia,
        });

        (<FormArray>this.formGroup.controls['formulas']).removeAt(0);
        elementos[0].formulas.forEach((element: any) => {
          this.agregarFormula(element.titulo, element.formula);
        });
        (<FormArray>this.formGroup.controls['imagenes']).removeAt(0);
        elementos[0].imagenes.forEach((imagen: string) => {
          this.agregarImagen(imagen);
        });
      }
    });

  }
  agregarImagen = (imagen?: string, ) => {
    (<FormArray>this.formGroup.controls['imagenes']).push(
      new FormControl(imagen, Validators.required)
    );
  }
  agregarFormula = (titulo?: string, formula?: string) => {
    (<FormArray>this.formGroup.controls['formulas']).push(
      this.formBuilder.group({
        titulo: [titulo, [Validators.required]],
        formula: [formula, [Validators.required]]
      })
    );
  }

  iniciarElemento = () => {
    this.formGroup = this.formBuilder.group({
      descripcion: ['', [Validators.required, Validators.minLength(15)]],
      formulas: this.formBuilder.array([this.formBuilder.group({
        titulo: ['', [Validators.required]],
        formula: ['', [Validators.required]]
      })]),
      imagenes: this.formBuilder.array(
        [Validators.required]
      ),
      nombre: ['', [Validators.required]],
      referencia: this.formBuilder.group({
        titulo: ['', [Validators.required]],
        link: ['', [Validators.required]]
      })
    });
  }
  borrarFormula = ($event, index) => { 
      (<FormArray>this.formGroup.controls['formulas']).removeAt(index);
  }
  borrarImagen = ($event, index) => { 
      (<FormArray>this.formGroup.controls['imagenes']).removeAt(index); 
  }

  ngOnInit() {
  }

  guardar = (id: string) => { 
    if (this.formGroup.valid) {

      this.actualizarNombreElementoMostrado();

      const elemento = {
        id: id,
        nombre: this.elementoNombre,
        descripcion: this.formGroup.value.descripcion,
        imagenes: this.formGroup.value.imagenes,
        referencia: {
          link: this.formGroup.value.referencia.link,
          titulo: this.formGroup.value.referencia.titulo,
        },
        formulas: this.formGroup.value.formulas,
      }
      
      this.elementoId = this.dataService.saveElemento(elemento);
 
      this.regresarAPrincipal();

      this.snotifyService.success('Información guardada correctamente', 'Información');
    } else {
      this.snotifyService.warning('Debe completar la información correctamente', 'Atención');
    }
  }

  actualizarNombreElementoMostrado = () => {
    this.elementoNombre = this.formGroup.value.nombre.toLowerCase();
  }

  regresarAPrincipal = () => {
    this.router.navigate(['secure', 'principal']);
  }

 
  detectFiles(event: any) {
    this.selectedFiles = event.target.files;
  }

  uploadSingle() {
    let file = this.selectedFiles.item(0);
    this.currentUpload = new Upload(file);
     
     this.uploadService.pushUpload(this.currentUpload, this.elementoNombre);
     
    
  }

  

}
