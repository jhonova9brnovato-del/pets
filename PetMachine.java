public class PetMachine {
    private static final int MAX_WATER = 30;
    private static final int MAX_SHAMPOO = 10;
    private static final int WATER_PER_USE = 10;
    private static final int SHAMPOO_PER_USE = 2;
    private static final int REFILL_STEP = 2;

    private boolean clean = true;
    private int water = MAX_WATER;
    private int shampoo = 0;
    private Pet pet;

    public void takeAShowerInAPet() {
        if (this.pet == null) {
            System.out.println("Não tem pet na máquina");
            return;
        }
        if (!hasEnoughSupplies()) {
            return;
        }
        this.water -= WATER_PER_USE;
        this.shampoo -= SHAMPOO_PER_USE;
        this.pet.setClean(true);
        System.out.println("O pet " + pet.getName() + " está limpo");
    }

    public void addWater() {
        if (this.water >= MAX_WATER) {
            System.out.println("A capacidade de água da máquina está no máximo");
            return;
        }
        this.water = Math.min(MAX_WATER, this.water + REFILL_STEP);
    }

    public void addShampoo() {
        if (this.shampoo >= MAX_SHAMPOO) {
            System.out.println("A capacidade de shampoo da máquina está no máximo");
            return;
        }
        this.shampoo = Math.min(MAX_SHAMPOO, this.shampoo + REFILL_STEP);
    }

    public int getWater() {
        return water;
    }

    public int getShampoo() {
        return shampoo;
    }

    public boolean hasPet() {
        return pet != null;
    }

    public void setPet(Pet pet) {
        if (!this.clean) {
            System.out.println("A máquina está suja");
            return;
        }
        if (hasPet()) {
            System.out.println("Já tem o pet " + this.pet.getName() + " na máquina");
            return;
        }
        this.pet = pet;
        System.out.println("O pet " + pet.getName() + " foi colocado na máquina");
    }

    public void removePet() {
        if (this.pet == null) {
            System.out.println("Não tem pet na máquina");
            return;
        }
        // se o pet sai sujo, ele deixa a máquina suja
        this.clean = this.pet.isClean();
        System.out.println("O pet " + this.pet.getName() + " foi retirado da máquina");
        this.pet = null;
    }

    public void wash() {
        if (!hasEnoughSupplies()) {
            return;
        }
        this.water -= WATER_PER_USE;
        this.shampoo -= SHAMPOO_PER_USE;
        this.clean = true;
        System.out.println("A máquina está limpa");
    }

    private boolean hasEnoughSupplies() {
        if (this.water < WATER_PER_USE) {
            System.out.println("Água insuficiente na máquina");
            return false;
        }
        if (this.shampoo < SHAMPOO_PER_USE) {
            System.out.println("Shampoo insuficiente na máquina");
            return false;
        }
        return true;
    }
}