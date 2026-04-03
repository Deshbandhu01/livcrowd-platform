package com.livcrowd.config;

import com.livcrowd.model.Place;
import com.livcrowd.model.Category;
import com.livcrowd.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PlaceRepository placeRepository;

    @Override
    public void run(String... args) {
        if (placeRepository.count() == 0) {
            Place h1 = new Place();
            h1.setName("City General Hospital");
            h1.setCategory(Category.HOSPITAL);
            h1.setAddress("123 Med Lane, Downtown");
            h1.setCapacity(500);
            h1.setIsActive(true);

            Place c1 = new Place();
            c1.setName("Neon Brew Café");
            c1.setCategory(Category.CAFE);
            c1.setAddress("45 Tech Park, North Wing");
            c1.setCapacity(50);
            c1.setIsActive(true);

            Place cl1 = new Place();
            cl1.setName("Institute of Technology");
            cl1.setCategory(Category.COLLEGE);
            cl1.setAddress("Knowledge Campus, Sector 9");
            cl1.setCapacity(2000);
            cl1.setIsActive(true);

            placeRepository.saveAll(Arrays.asList(h1, c1, cl1));
            System.out.println(">> Seed data initialized in H2");
        }
    }
}
