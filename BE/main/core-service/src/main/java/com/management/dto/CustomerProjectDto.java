package com.management.dto;

public class CustomerProjectDto {
    private Long id;
    private String projName;
    private String address;
    private String description;
    private Double price;
    private Long ownerId;
    private String ownerName;

    public CustomerProjectDto() {}

    public CustomerProjectDto(Long id, String projName, String address, String description, Double price, Long ownerId, String ownerName) {
        this.id = id;
        this.projName = projName;
        this.address = address;
        this.description = description;
        this.price = price;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjName() { return projName; }
    public void setProjName(String projName) { this.projName = projName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
}
