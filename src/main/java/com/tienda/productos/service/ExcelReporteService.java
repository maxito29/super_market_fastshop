package com.tienda.productos.service;

import com.tienda.productos.entity.Producto;
import com.tienda.productos.entity.Usuario;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelReporteService {

    public byte[] generarExcelProductos(List<Producto> productos) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Productos");
            CellStyle estiloHeader = crearEstiloHeader(workbook);
            String[] columnas = {"Código", "Nombre", "Categoría", "Precio (S/)", "Stock", "Estado", "Fecha de creación"};

            Row filaHeader = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell celda = filaHeader.createCell(i);
                celda.setCellValue(columnas[i]);
                celda.setCellStyle(estiloHeader);
            }

            int numeroFila = 1;
            for (Producto p : productos) {
                Row fila = sheet.createRow(numeroFila++);
                fila.createCell(0).setCellValue(p.getCodigo());
                fila.createCell(1).setCellValue(p.getNombre());
                fila.createCell(2).setCellValue(p.getCategoria().getNombre());
                fila.createCell(3).setCellValue(p.getPrecio().doubleValue());
                fila.createCell(4).setCellValue(p.getStock());
                fila.createCell(5).setCellValue(Boolean.TRUE.equals(p.getActivo()) ? "Activo" : "Inactivo");
                fila.createCell(6).setCellValue(p.getFechaCreacion().toString());
            }

            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            return escribir(workbook);
        }
    }

    public byte[] generarExcelUsuarios(List<Usuario> usuarios) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Trabajadores");
            CellStyle estiloHeader = crearEstiloHeader(workbook);
            String[] columnas = {"Nombre", "Usuario", "Correo", "Rol", "Estado", "Fecha de creación"};

            Row filaHeader = sheet.createRow(0);
            for (int i = 0; i < columnas.length; i++) {
                Cell celda = filaHeader.createCell(i);
                celda.setCellValue(columnas[i]);
                celda.setCellStyle(estiloHeader);
            }

            int numeroFila = 1;
            for (Usuario u : usuarios) {
                Row fila = sheet.createRow(numeroFila++);
                fila.createCell(0).setCellValue(u.getNombre());
                fila.createCell(1).setCellValue(u.getUsername());
                fila.createCell(2).setCellValue(u.getEmail() != null ? u.getEmail() : "");
                fila.createCell(3).setCellValue(u.getRol().getNombre());
                fila.createCell(4).setCellValue(Boolean.TRUE.equals(u.getActivo()) ? "Activo" : "Inactivo");
                fila.createCell(5).setCellValue(u.getFechaCreacion().toString());
            }

            for (int i = 0; i < columnas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            return escribir(workbook);
        }
    }

    private byte[] escribir(Workbook workbook) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        return out.toByteArray();
    }

    private CellStyle crearEstiloHeader(Workbook workbook) {
        CellStyle estilo = workbook.createCellStyle();
        Font fuente = workbook.createFont();
        fuente.setBold(true);
        fuente.setColor(IndexedColors.WHITE.getIndex());
        estilo.setFont(fuente);
        estilo.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
        estilo.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return estilo;
    }
}