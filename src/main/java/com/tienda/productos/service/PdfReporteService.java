package com.tienda.productos.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tienda.productos.dto.CategoriaConteoResponse;
import com.tienda.productos.dto.DashboardResumenResponse;
import com.tienda.productos.dto.ProductoStockResponse;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReporteService {

    private static final Color COLOR_VERDE = new Color(22, 163, 74);
    private static final Font FUENTE_TITULO = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(22, 101, 52));
    private static final Font FUENTE_SUBTITULO = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY);
    private static final Font FUENTE_SECCION = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(15, 23, 42));
    private static final Font FUENTE_HEADER_TABLA = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font FUENTE_CELDA = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);

    public byte[] generarReporteDashboard(DashboardResumenResponse resumen, String nombreAdmin) throws DocumentException {
        Document document = new Document(PageSize.A4, 40, 40, 50, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        Paragraph titulo = new Paragraph("Reporte del Supermercado", FUENTE_TITULO);
        titulo.setAlignment(Element.ALIGN_CENTER);
        document.add(titulo);

        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        Paragraph subtitulo = new Paragraph("Generado el " + fecha + " por " + nombreAdmin, FUENTE_SUBTITULO);
        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(25);
        document.add(subtitulo);

        document.add(new Paragraph("Resumen general", FUENTE_SECCION));
        document.add(Chunk.NEWLINE);

        PdfPTable tablaResumen = new PdfPTable(2);
        tablaResumen.setWidthPercentage(100);
        tablaResumen.setSpacingAfter(20);
        agregarFilaResumen(tablaResumen, "Productos activos", String.valueOf(resumen.getTotalProductos()));
        agregarFilaResumen(tablaResumen, "Categorías activas", String.valueOf(resumen.getTotalCategorias()));
        agregarFilaResumen(tablaResumen, "Trabajadores activos", String.valueOf(resumen.getTotalTrabajadores()));
        agregarFilaResumen(tablaResumen, "Productos con stock bajo", String.valueOf(resumen.getProductosStockBajo()));
        document.add(tablaResumen);

        document.add(new Paragraph("Productos por categoría", FUENTE_SECCION));
        document.add(Chunk.NEWLINE);

        PdfPTable tablaCategorias = new PdfPTable(2);
        tablaCategorias.setWidthPercentage(100);
        tablaCategorias.setSpacingAfter(20);
        agregarHeaderTabla(tablaCategorias, "Categoría", "Cantidad de productos");
        for (CategoriaConteoResponse c : resumen.getProductosPorCategoria()) {
            agregarCelda(tablaCategorias, c.getCategoria());
            agregarCelda(tablaCategorias, String.valueOf(c.getCantidad()));
        }
        document.add(tablaCategorias);

        document.add(new Paragraph("Top 5 productos con más stock", FUENTE_SECCION));
        document.add(Chunk.NEWLINE);

        PdfPTable tablaTop5 = new PdfPTable(2);
        tablaTop5.setWidthPercentage(100);
        agregarHeaderTabla(tablaTop5, "Producto", "Stock");
        for (ProductoStockResponse p : resumen.getTopProductosStock()) {
            agregarCelda(tablaTop5, p.getNombre());
            agregarCelda(tablaTop5, String.valueOf(p.getStock()));
        }
        document.add(tablaTop5);

        document.close();
        return out.toByteArray();
    }

    private void agregarFilaResumen(PdfPTable tabla, String etiqueta, String valor) {
        PdfPCell celdaEtiqueta = new PdfPCell(new Phrase(etiqueta, FUENTE_CELDA));
        celdaEtiqueta.setBorderColor(Color.LIGHT_GRAY);
        celdaEtiqueta.setPadding(8);

        PdfPCell celdaValor = new PdfPCell(new Phrase(valor, new Font(Font.HELVETICA, 12, Font.BOLD, COLOR_VERDE)));
        celdaValor.setBorderColor(Color.LIGHT_GRAY);
        celdaValor.setPadding(8);
        celdaValor.setHorizontalAlignment(Element.ALIGN_RIGHT);

        tabla.addCell(celdaEtiqueta);
        tabla.addCell(celdaValor);
    }

    private void agregarHeaderTabla(PdfPTable tabla, String col1, String col2) {
        PdfPCell c1 = new PdfPCell(new Phrase(col1, FUENTE_HEADER_TABLA));
        c1.setBackgroundColor(COLOR_VERDE);
        c1.setPadding(6);

        PdfPCell c2 = new PdfPCell(new Phrase(col2, FUENTE_HEADER_TABLA));
        c2.setBackgroundColor(COLOR_VERDE);
        c2.setPadding(6);

        tabla.addCell(c1);
        tabla.addCell(c2);
    }

    private void agregarCelda(PdfPTable tabla, String texto) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, FUENTE_CELDA));
        celda.setPadding(6);
        tabla.addCell(celda);
    }
}